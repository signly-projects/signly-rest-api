require('dotenv').config()
const url = require('url')
const uuidv4 = require('uuid/v4')
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
  const uuid = uuidv4()

  const jobInputAsset = getOrCreateJobInputAsset(uuid, videoFile)

  return videoFile
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

const appendFileToAsset = async (videoFile) => {
  let date = new Date()
  date.setHours(date.getHours() + 1)

  let sasInput = {
    permissions: 'ReadWrite',
    expiryTime: date
  }
  const response = await azureMediaServicesClient.assets.listContainerSas(RESOURCE_GROUP, AMS_ACCOUNT_NAME, videoFile.originalname, sasInput)
  const uploadSasUrl = response.assetContainerSasUrls[0] || null
  const sasUri = url.parse(uploadSasUrl)
  const containerName = sasUri.pathname.replace(/^\/+/g, '')
  const blobName = `${videoFile.originalname}_${new Date().getTime()}.mp4`

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blobName)
  const blockBlobClient = blobClient.getBlockBlobClient()

  return await blockBlobClient.uploadFile(videoFile.path)
}

const getOrCreateJobInputAsset = async (uuid, videoFile) => {
  let asset = await azureMediaServicesClient.assets.get(RESOURCE_GROUP, AMS_ACCOUNT_NAME, videoFile.originalname)

  if (asset.error) {
    asset = await createInputAsset(videoFile)
  }

  return {
    odatatype: '#Microsoft.Media.JobInputAsset',
    assetName: asset.name
  }
}

const createInputAsset = async (videoFile) => {
  let asset = await azureMediaServicesClient.assets.createOrUpdate(RESOURCE_GROUP, AMS_ACCOUNT_NAME, videoFile.originalname, {
    description: videoFile.originalname,
  })

  await appendFileToAsset(videoFile)

  return asset
}

module.exports = {
  storeVideoFile
}
