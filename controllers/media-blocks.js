const { MediaBlock } = require('../models/media-block')

exports.getMediaBlocks = async (req, res, next) => {
  const mediaBlocks = await MediaBlock.find().sort({ transcript: 'desc' })

  res.status(200).send({ mediaBlocks: mediaBlocks })
}

exports.getMediaBlock = async (req, res, next) => {
  const mediaBlock = await MediaBlock.findById(req.params.id)

  res.status(200).send({ mediaBlock: mediaBlock })
}

exports.getMediaBlockByTranscript = async (req, res, next) => {
  const mediaBlock = await MediaBlock.findOne({ transcript: decodeURIComponent(req.query.transcript) })

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given transcript not found.')
  }

  res.status(200).send({ mediaBlock: mediaBlock })
}
