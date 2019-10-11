require('dotenv').config()
const url = require('url')
const to = require('await-to-js').default
const msRestNodeAuth = require('@azure/ms-rest-nodeauth')
const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient, SharedKeyCredential } = require('@azure/storage-blob')
const { AzureMediaServices } = require('@azure/arm-mediaservices')

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

let azureMediaServicesClient
let blobServiceClient

const storeVideoFile = async (videoFile) => {
  const authResponse = await logInToAzure()
  const sharedKeyCredential = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCOUNT_KEY)

  const defaultAzureCredential = new DefaultAzureCredential()

  azureMediaServicesClient = new AzureMediaServices(authResponse.credentials, AZURE_SUBSCRIPTION_ID, { noRetryPolicy: true })

  blobServiceClient = new BlobServiceClient(
    `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
  )

  const encodingTransform = await getOrCreateTransform()

  const currentDate = new Date().getTime()
  const amsIdentifier = `${videoFile.originalname}_${currentDate}`

  const inputAssetName = `input_${amsIdentifier}`
  const jobInputAsset = await getOrCreateJobInputAsset(videoFile, inputAssetName)

  const outputAssetName = `output_${amsIdentifier}`
  const jobOutputAsset = await createOutputAsset(outputAssetName)

  const encodingJobName = `job_${amsIdentifier}`

  let encodingError, encodingJob

  [encodingError, encodingJob] = await to(submitEncodingJob(jobInputAsset, jobOutputAsset, encodingJobName))

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

const getOrCreateTransform = async () => {
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
  const asset = await createInputAsset(videoFile, inputAssetName)

  await appendFileToAsset(videoFile, inputAssetName)

  return {
    odatatype: '#Microsoft.Media.JobInputAsset',
    assetName: asset.name
  }
}

const createInputAsset = async (videoFile, assetName) => {
  let asset = await azureMediaServicesClient.assets.createOrUpdate(RESOURCE_GROUP, AMS_ACCOUNT_NAME, assetName, {
    description: assetName,
  })

  return asset
}

const createOutputAsset = async (assetName) => {
  return await azureMediaServicesClient.assets.createOrUpdate(RESOURCE_GROUP, AMS_ACCOUNT_NAME, assetName, {
    description: assetName,
  })
}

const submitEncodingJob = async (jobInputAsset, outputAsset, encodingJobName) => {
  let jobOutputs = [
    {
      odatatype: '#Microsoft.Media.JobOutputAsset',
      assetName: outputAsset.name
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

const getEncodingJobResult = async (amsIdentifier) => {
  if (!azureMediaServicesClient) {
    const authResponse = await logInToAzure()
    azureMediaServicesClient = new AzureMediaServices(authResponse.credentials, AZURE_SUBSCRIPTION_ID, { noRetryPolicy: true })
  }

  const jobName = `job_${amsIdentifier}`
  const outputAssetName = `output_${amsIdentifier}`
  const inputAssetName = `input_${amsIdentifier}`
  const locatorName = `locator_${amsIdentifier}`

  const encodingJob = await azureMediaServicesClient.jobs.get(
    RESOURCE_GROUP,
    AMS_ACCOUNT_NAME,
    ENCODING_TRANSFORM_NAME,
    jobName
  )

  let streamingUrls = []

  if (encodingJob.state === 'Finished') {
    let locator = await createStreamingLocator(outputAssetName, locatorName)

    streamingUrls = await getStreamingUrls(locator.name)

    // console.log('deleting jobs ...')
    // const rest = await azureMediaServicesClient.jobs.deleteMethod(
    //   RESOURCE_GROUP,
    //   AMS_ACCOUNT_NAME,
    //   ENCODING_TRANSFORM_NAME,
    //   jobName
    // )
    // // await azureMediaServicesClient.assets.deleteMethod(resourceGroup, accountName, outputAsset.name);

    // const r = await azureMediaServicesClient.assets.deleteMethod(
    //   RESOURCE_GROUP,
    //   AMS_ACCOUNT_NAME,
    //   inputAssetName
    // )
  } else if (encodingJob.state === 'Error') {
    console.log(`${encodingJob.name} failed. Error details:`)
    console.log(encodingJob.outputs[0].error)
  } else if (encodingJob.state === 'Canceled') {
    console.log(`${encodingJob.name} was unexpectedly canceled.`)
  } else {
    console.log(`${encodingJob.name} is still in progress.  Current state is ${encodingJob.state}.`);
  }

  return {
    encodingState: encodingJob.state === 'Finished' ? 'Closed' : encodingJob.state,
    streamingUrls: streamingUrls
  }
}

const createStreamingLocator = async (assetName, locatorName) => {
  const streamingLocator = {
    assetName: assetName,
    // streamingPolicyName: 'Predefined_ClearStreamingOnly'
    streamingPolicyName: 'Predefined_DownloadAndClearStreaming'
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
  // Make sure the streaming endpoint is in the 'Running' state.
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

  let streamingUrls = []

  for (let i = 0; i < paths.downloadPaths.length; i++){
    // let path = paths.streamingPaths[i].paths[0]
    // const streamingUrl = 'https://'+ streamingEndpoint.hostName + path
    // streamingUrls.push(streamingUrl)
    // console.log(streamingUrl)

    let path = paths.downloadPaths[i]
    const downloadPath = 'https://' + streamingEndpoint.hostName + path
    streamingUrls.push(downloadPath)

    console.log(downloadPath)
  }

  return streamingUrls
}

module.exports = {
  storeVideoFile,
  getEncodingJobResult
}
