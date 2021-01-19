require('dotenv').config()
// const winston = require('winston')
const to = require('await-to-js').default
const Jobs = require('bull')

const { deleteFile } = require('~utils/storage')
const MediaBlocksService = require('~services/media-blocks.service')
const AzureService = require('~services/azure.service')

const ENV = process.env.NODE_ENV
const REDIS_PORT = process.env.REDIS_PORT
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASS = process.env.REDIS_PASS

let jobs

if (ENV === 'prod' || ENV === 'stag' || ENV === 'dev') {
  jobs = new Jobs('jobs', {
    redis: {
      port: Number(REDIS_PORT),
      host: REDIS_HOST,
      password: REDIS_PASS,
      tls: {
        servername: REDIS_HOST
      }
    }
  })
} else {
  jobs = new Jobs('jobs', process.env.REDIS_URI)
}

const MAX_ATTEMPTS = 30
const BACKOFF_TIME = 30000

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
  } else if (result.encodingState === 'Error') {
    console.log('Cancelling job ' + job.id)
    await job.discard()
    await job.moveToFailed({message: 'Job is cancelled by the user request'}, true)

    await to(AzureService.deleteAssets(job.data.amsIdentifier))
  } else {
    return Promise.reject(result)
  }
})

jobs.on('completed', async (job) => {
  console.log('Job completed:', `job_${job.data.amsIdentifier}`)
  await deleteFile(`video_${job.data.mediaBlockId}.mp4`)
  //
  // await job.remove()
})

jobs.on('failed', async (job, result) => {
  console.log('Job failed:', `job_${job.data.amsIdentifier} (State: ${result.encodingState})`)

  if (job.attemptsMade === MAX_ATTEMPTS) {
    await deleteFile(`video_${job.data.mediaBlockId}.mp4`)
    await MediaBlocksService.updateVideoState(job.data.mediaBlockId, 'Timed Out')
  }
})

jobs.on('error', (error) => {
  console.log(error)
})

module.exports = {
  jobs,
  MAX_ATTEMPTS,
  BACKOFF_TIME
}
