const { validateMediaBlock } = require('~models/media-block')

const MediaBlocksService = require('~services/media-blocks.service')

exports.getMediaBlock = async (req, res, next) => {
  const mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  res.status(200).send({ mediaBlock: mediaBlock })
}

exports.getMediaBlockByNormalizedText = async (req, res, next) => {
  const mediaBlock = await MediaBlocksService.findByNormalizedText(decodeURIComponent(req.query.normalizedText))

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given normalizedText not found.')
  }

  res.status(200).send({ mediaBlock: mediaBlock })
}

exports.patchMediaBlock = async (req, res, next) => {
  const newMediaBlock = req.body.mediaBlock

  const { error } = validateMediaBlock(newMediaBlock, 'patch')

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  mediaBlock = await MediaBlocksService.update(mediaBlock, newMediaBlock)

  res.status(200).send({ mediaBlock: mediaBlock })
}
exports.uploadVideo = async (req, res, next) => {
  if (req.fileValidationError) {
    res.status(422).json(req.fileValidationError.message)
  }

  res.status(200).send({ uploadedFile: req.file })
}

