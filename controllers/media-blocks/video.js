const MediaBlocksService = require('~services/media-blocks.service')
const AzureService = require('~services/azure.service')

// TODO: This is no meant to stay here, just for testing
exports.getVideo = async (req, res, next) => {
  let mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  let result = null

  if (mediaBlock.video && mediaBlock.video.amsIdentifier) {
    result = await AzureService.getEncodingJobResult(mediaBlock.video.amsIdentifier)
  }

  res.status(200).send({ encodingResult: result })
}

exports.uploadVideo = async (req, res, next) => {
  let mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  if (req.fileValidationError) {
    res.status(422).send(req.fileValidationError.message)
  }

  mediaBlock = await MediaBlocksService.createOrUpdateVideo(mediaBlock._id, req.file)

  res.status(200).send({ mediaBlock: mediaBlock })
}

exports.deleteVideo = async (req, res, next) => {
  let mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  mediaBlock = await MediaBlocksService.deleteVideo(mediaBlock)

  res.status(200).send({ mediaBlock: mediaBlock })
}
