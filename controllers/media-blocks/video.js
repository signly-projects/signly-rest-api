const { deleteFile } = require('~utils/storage')
const MediaBlocksService = require('~services/media-blocks.service')
const AzureService = require('~services/azure.service')

exports.uploadVideo = async (req, res, next) => {
  let mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  if (req.fileValidationError) {
    res.status(422).send(req.fileValidationError.message)
  }

  mediaBlock = await MediaBlocksService.addVideo(mediaBlock, req.file)

  const result = await AzureService.storeVideoFile(req.file)

  res.status(200).send({ mediaBlock: mediaBlock })
}

exports.deleteVideo = async (req, res, next) => {
  let mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  const videoFile = `video_${req.params.id}.mp4`

  await deleteFile(videoFile)
  mediaBlock = await MediaBlocksService.deleteVideo(mediaBlock)

  res.status(200).send({ mediaBlock: mediaBlock })
}
