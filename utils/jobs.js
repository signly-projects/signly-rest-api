require('dotenv').config()
const winston = require('winston')
const to = require('await-to-js').default
const Jobs = require('bull')

const { deleteFile } = require('~utils/storage')
const MediaBlocksService = require('~services/media-blocks.service')
const AzureService = require('~services/azure.service')

let jobs = new Jobs('jobs', process.env.REDIS_URI)
const MAX_ATTEMPTS = 10
const BACKOFF_TIME = 15000

jobs.process(async (job) => {
  console.log('Job started', job.data.mediaBlockId, job.data.amsIdentifier)

  let error, result
  [error, result] = await to(AzureService.getEncodingJobResult(job.data.amsIdentifier))

  if (error) {
    return Promise.reject(new Error('Can\'t retrieve encoding job data'))
  }

  await MediaBlocksService.updateVideoState(job.data.mediaBlockId, result.encodingState, result.videoUri)

  if (result.encodingState === 'Ready') {
    return Promise.resolve(result)
  } else {
    return Promise.reject(result)
  }
})

jobs.on('completed', async (job) => {
  console.log('Job completed: ', `job_${job.data.amsIdentifier}`)
  await deleteFile(`video_${job.data.mediaBlockId}.mp4`)

  job.remove()
})

jobs.on('failed', async (job, result) => {
  console.log('Job failed: ', `job_${job.data.amsIdentifier} (State: ${result.encodingState})`)

  if (result.encodingState === 'Error') {
    winston.error('Azure Encoding Error.')
  }
})

module.exports = {
  jobs,
  MAX_ATTEMPTS,
  BACKOFF_TIME
}
