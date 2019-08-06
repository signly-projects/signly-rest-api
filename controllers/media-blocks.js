const { MediaBlock, validateMediaBlock } = require('../models/media-block')

exports.getMediaBlocks = async (req, res, next) => {
  const mediaBlocks = await MediaBlock.find().sort({ normalizedText: 'desc' })

  res.status(200).send({ mediaBlocks: mediaBlocks })
}

exports.getMediaBlock = async (req, res, next) => {
  const mediaBlock = await MediaBlock.findById(req.params.id)

  res.status(200).send({ mediaBlock: mediaBlock })
}

exports.getMediaBlockByNormalizedText = async (req, res, next) => {
  const mediaBlock = await MediaBlock.findOne({ normalizedText: decodeURIComponent(req.query.normalizedText) })

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

  let mediaBlock = await MediaBlock.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  mediaBlock.bslScript = newMediaBlock.bslScript
  mediaBlock.videoUri = newMediaBlock.videoUri

  mediaBlock = await mediaBlock.save()

  res.status(200).send({ mediaBlock: mediaBlock })
}
