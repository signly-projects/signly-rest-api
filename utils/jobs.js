require('dotenv').config()
const to = require('await-to-js').default
const Jobs = require('bull')
const MediaBlocksService = require('~services/media-blocks.service')
const AzureService = require('~services/azure.service')

let jobs = new Jobs('jobs', process.env.REDIS_URI)

jobs.process(async (job) => {
  console.log('Job started', job.data.mediaBlockId, job.data.amsIdentifier)

  let error, result
  [error, result] = await to(AzureService.getEncodingJobResult(job.data.amsIdentifier))

  if (error) {
    return Promise.reject(new Error('Can\'t retrieve encoding job data'))
  }

  await MediaBlocksService.updateVideoState(job.data.mediaBlockId, result.encodingState, result.videoUri)

  console.log('State:', result.encodingState, result.videoUri)

  if (result.encodingState === 'Ready') {
    return Promise.resolve(result)
  } else {
    return Promise.reject(new Error(`Video transcoding not ready. Status: ${result.encodingState}`))
  }
})

// jobs.on('completed', job => {
//   MediaBlocksService.updateVideoState(job.data.mediaBlockId, result.encodingState, videoUrl)
// })

module.exports = {
  jobs
}
