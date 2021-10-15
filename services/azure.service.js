require('dotenv').config()
const url = require('url')
const to = require('await-to-js').default
const msRestNodeAuth = require('@azure/ms-rest-nodeauth')
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const { AzureMediaServices } = require('@azure/arm-mediaservices')

let { jobs, MAX_ATTEMPTS, BACKOFF_TIME } = require('~utils/jobs')

const AAD_CLIENT_ID = process.env.AAD_CLIENT_ID
const AAD_SECRET = process.env.AAD_SECRET
const AAD_TENANT_ID = process.env.AAD_TENANT_ID
const RESOURCE_GROUP = process.env.RESOURCE_GROUP
const AMS_ACCOUNT_NAME = process.env.AMS_ACCOUNT_NAME
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME
const STORAGE_ACCOUNT_KEY = process.env.STORAGE_ACCOUNT_KEY
const AZURE_SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID
const REGION = process.env.REGION
const ENCODING_TRANSFORM_NAME = 'TransformWithAdaptiveStreamingPreset'
const ADAPTIVE_STREAMING_TRANSFORM_PRESET = {
  odatatype: '#Microsoft.Media.BuiltInStandardEncoderPreset',
  presetName: 'ContentAdaptiveMultipleBitrateMP4'
}
const ENV = process.env.NODE_ENV

let authResponse
let azureMediaServicesClient
let blobServiceClient

const storeVideoFile = async (mediaBlockId, videoFile) => {
  if (!authResponse) {
    authResponse = await logInToAzure()
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCOUNT_KEY)
  azureMediaServicesClient = new AzureMediaServices(authResponse.credentials, AZURE_SUBSCRIPTION_ID, { noRetryPolicy: true })

  blobServiceClient = new BlobServiceClient(
    `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
  )

  await createTransform()

  const currentDate = new Date().getTime()
  const amsIdentifier = `${videoFile.originalname}_${currentDate}`
  const inputAssetName = `${ENV}_input_${amsIdentifier}`
  const outputAssetName = `${ENV}_${amsIdentifier}`
  const encodingJobName = `${ENV}_job_${amsIdentifier}`

  const jobInputAsset = await getOrCreateJobInputAsset(videoFile, inputAssetName)
  const jobOutputAsset = await createOutputAsset(outputAssetName)

  let encodingError, encodingJob

  [encodingError, encodingJob] = await to(submitEncodingJob(jobInputAsset, jobOutputAsset.name, encodingJobName))

  await jobs.add(
    {
      amsIdentifier: amsIdentifier,
      mediaBlockId: mediaBlockId
    },
    {
      attempts: MAX_ATTEMPTS,
      backoff: BACKOFF_TIME
    }
  )

  return {
    encodingState: encodingError ? 'None' : encodingJob.state,
    amsIdentifier: amsIdentifier
  }
}

const logInToAzure = async () => {
  let error, authResponse

  [error, authResponse] = await to(
    msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(AAD_CLIENT_ID, AAD_SECRET, AAD_TENANT_ID)
  )

  if (error) {
    return null
  }

  return authResponse
}

const createTransform = async () => {
  let error, transform

  [error, transform] = await to (
    azureMediaServicesClient.transforms.get(
      RESOURCE_GROUP,
      AMS_ACCOUNT_NAME,
      ENCODING_TRANSFORM_NAME
    )
  )

  if (!transform) {
    [error, transform] = await to (
      azureMediaServicesClient.transforms.createOrUpdate(
        RESOURCE_GROUP,
        AMS_ACCOUNT_NAME,
        ENCODING_TRANSFORM_NAME,
        {
          name: ENCODING_TRANSFORM_NAME,
          location: REGION,
          outputs: [{
            preset: ADAPTIVE_STREAMING_TRANSFORM_PRESET
          }]
        }
      )
    )
  }

  if (error) {
    return null
  }

  return transform
}

const appendFileToAsset = async (videoFile, assetName) => {
  let date = new Date()
  date.setHours(date.getHours() + 1)

  let sasInput = {
    permissions: 'ReadWrite',
    expiryTime: date
  }
  const response = await azureMediaServicesClient.assets.listContainerSas(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    assetName,
    sasInput
  )
  const uploadSasUrl = response.assetContainerSasUrls[0] || null
  const sasUri = url.parse(uploadSasUrl)
  const containerName = sasUri.pathname.replace(/^\/+/g, '')
  const blobName = `${videoFile.originalname}_${new Date().getTime()}.mp4`

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blobName)
  const blockBlobClient = blobClient.getBlockBlobClient()

  return await blockBlobClient.uploadFile(videoFile.path)
}

const getOrCreateJobInputAsset = async (videoFile, inputAssetName) => {
  const asset = await createInputAsset(inputAssetName)

  await appendFileToAsset(videoFile, inputAssetName)

  return {
    odatatype: '#Microsoft.Media.JobInputAsset',
    assetName: asset.name
  }
}

const createInputAsset = async (assetName) => {
  return await azureMediaServicesClient.assets.createOrUpdate(RESOURCE_GROUP, AMS_ACCOUNT_NAME, assetName, {
    description: assetName,
  })
}

const createOutputAsset = async (assetName) => {
  return await azureMediaServicesClient.assets.createOrUpdate(RESOURCE_GROUP, AMS_ACCOUNT_NAME, assetName, {
    description: assetName,
  })
}

const submitEncodingJob = async (jobInputAsset, outputAssetName, encodingJobName) => {
  let jobOutputs = [
    {
      odatatype: '#Microsoft.Media.JobOutputAsset',
      assetName: outputAssetName
    }
  ]

  return await azureMediaServicesClient.jobs.create(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    ENCODING_TRANSFORM_NAME,
    encodingJobName,
    {
      input: jobInputAsset,
      outputs: jobOutputs
    }
  )
}

exports.deleteAssets = async (amsIdentifier) => {
  if (!authResponse) {
    authResponse = await logInToAzure()
  }

  azureMediaServicesClient = new AzureMediaServices(authResponse.credentials, AZURE_SUBSCRIPTION_ID, { noRetryPolicy: true })

  const jobName = `${ENV}_job_${amsIdentifier}`
  const inputAssetName = `${ENV}_input_${amsIdentifier}`
  const outputAssetName = `${ENV}_${amsIdentifier}`

  await azureMediaServicesClient.jobs.deleteMethod(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    ENCODING_TRANSFORM_NAME,
    jobName
  )

  await azureMediaServicesClient.assets.deleteMethod(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    inputAssetName
  )

  await azureMediaServicesClient.assets.deleteMethod(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    outputAssetName
  )

  return 'Done'
}

const getEncodingJobResult = async (amsIdentifier) => {
  if (!authResponse) {
    authResponse = await logInToAzure()
  }

  azureMediaServicesClient = new AzureMediaServices(authResponse.credentials, AZURE_SUBSCRIPTION_ID, { noRetryPolicy: true })

  const jobName = `${ENV}_job_${amsIdentifier}`
  const inputAssetName = `${ENV}_input_${amsIdentifier}`
  const outputAssetName = `${ENV}_${amsIdentifier}`
  const locatorName = `locator_${amsIdentifier}`

  const encodingJob = await azureMediaServicesClient.jobs.get(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    ENCODING_TRANSFORM_NAME,
    jobName
  )

  let videoUri = null

  if (encodingJob.state === 'Finished') {
    let locator = await createStreamingLocator(outputAssetName, locatorName)

    videoUri = await getStreamingUrls(locator.name)

    await azureMediaServicesClient.jobs.deleteMethod(
      RESOURCE_GROUP,
      AMS_ACCOUNT_NAME,
      ENCODING_TRANSFORM_NAME,
      jobName
    )

    await azureMediaServicesClient.assets.deleteMethod(
      RESOURCE_GROUP,
      AMS_ACCOUNT_NAME,
      inputAssetName
    )
  }

  return {
    encodingState: encodingJob.state === 'Finished' ? 'Ready' : encodingJob.state,
    videoUri: videoUri
  }
}
exports.getEncodingJobResult = getEncodingJobResult

const createStreamingLocator = async (assetName, locatorName) => {
  const streamingLocator = {
    assetName: assetName,
    // streamingPolicyName: 'Predefined_ClearStreamingOnly'
    streamingPolicyName: 'Predefined_DownloadOnly'
  }

  let locatorArray = await to(azureMediaServicesClient.streamingLocators.get(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    locatorName
  ))

  let locator = locatorArray[1]

  if (locator.error) {
    locator = await azureMediaServicesClient.streamingLocators.create(
      RESOURCE_GROUP,
      AMS_ACCOUNT_NAME,
      locatorName,
      streamingLocator
    )
  }

  return locator
}

const getStreamingUrls = async (locatorName) => {
  if (!authResponse) {
    authResponse = await logInToAzure()
  }

  if (!azureMediaServicesClient) {
    azureMediaServicesClient = new AzureMediaServices(authResponse.credentials, AZURE_SUBSCRIPTION_ID, { noRetryPolicy: true })
  }

  let streamingEndpoint = await azureMediaServicesClient.streamingEndpoints.get(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    'default'
  )

  let paths = await azureMediaServicesClient.streamingLocators.listPaths(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    locatorName
  )

  let videoUri = null

  for (let i = 0; i < paths.downloadPaths.length; i++){
    const path = paths.downloadPaths[i]
    const downloadPath = 'https://' + streamingEndpoint.hostName + path

    if (downloadPath.includes('_608x1080_') && downloadPath.endsWith('.mp4')) {
      videoUri = downloadPath
    }
    console.log(videoUri)
  }

  return videoUri
}

module.exports = {
  storeVideoFile,
  getEncodingJobResult,
  getStreamingUrls
}
