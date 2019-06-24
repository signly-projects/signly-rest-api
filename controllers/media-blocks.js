const { MediaBlock, validateMediaBlock } = require('../models/media-block')

exports.getMediaBlocks = async (req, res, next) => {
  const mediaBlocks = await MediaBlock.find().sort({ requested: 'desc' })

  res.status(200).send({ mediaBlocks: mediaBlocks })
}
