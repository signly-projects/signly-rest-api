const { MediaBlock } = require('~models/media-block')
const MediaBlocksService = require('~services/media-blocks.service')

exports.createVideo = async (req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(req.params)

  let mediaBlock = await MediaBlock.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('MediaBlock with the given ID not found.')
  }

  if (!req.body.translatorEmail) {
    return res.status(401).send('Translator email not provided.')
  }

  if (!req.file) {
    return res.status(401).send('Video file not provided.')
  }

  // eslint-disable-next-line no-console
  console.log('Translator email', req.body.translatorEmail)

  mediaBlock = await MediaBlocksService.updateOrCreateVideo(mediaBlock, req.file, req.body.translatorEmail)

  res.status(200).send({ mediaBlock })
}
