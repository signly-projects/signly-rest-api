const { ExternalPage } = require('../models/external-page')
const { MediaBlock } = require('../models/media-block')

exports.getExternalPage = async (req, res, next) => {
  const pageUri = decodeURIComponent(req.query.uri)

  if (!pageUri) {
    return res.status(422).send('External page URI not specified.')
  }

  const mediaBlock = await MediaBlock.findOne({ transcript: decodeURIComponent(req.query.transcript) })

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given transcript not found.')
  }

  res.status(200).send({ mediaBlock: mediaBlock })
}
