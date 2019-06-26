const { MediaBlock } = require('../models/page')

exports.getMediaBlocks = async (req, res, next) => {
  const mediaBlocks = await MediaBlock.find().sort({ transcript: 'desc' })

  res.status(200).send({ mediaBlocks: mediaBlocks })
}

exports.getMediaBlock = async (req, res, next) => {
  const mediaBlock = await MediaBlock.findById(req.params.id)

  res.status(200).send({ mediaBlock: mediaBlock })
}
