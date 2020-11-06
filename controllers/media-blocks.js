const { validateMediaBlock } = require('~models/media-block')

const MediaBlocksService = require('~services/media-blocks.service')

exports.getMediaBlocks = async (req, res, next) => {
  const result = await MediaBlocksService.findAll(req.query)

  res.status(200).send({
    mediaBlocks: result.mediaBlocks,
    mediaBlocksCount: result.mediaBlocksCount
  })
}

exports.getMediaBlocksExport = async (req, res, next) => {
  const mediaBlocks = await MediaBlocksService.findAll(req.query)

  const fileName = `lexicon-${new Date().toISOString()}.xls`

  const mediaBlocksData = mediaBlocks.map(mb => {
    return Object.assign({}, {
      status: mb.status,
      id: mb.id,
      text: mb.rawText,
      updatedAt: mb.updatedAt.toISOString()
    })
  })

  res.xls(fileName, mediaBlocksData)
}

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
  const newMediaBlock = {
    bslScript: req.body.bslScript,
    status: req.body.status,
    video: req.body.video
  }

  const { error } = validateMediaBlock(newMediaBlock, 'patch')

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  if (req.fileValidationError) {
    return res.status(422).send(req.fileValidationError.message)
  }

  let mediaBlock = await MediaBlocksService.findById(req.params.id)

  if (!mediaBlock) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  mediaBlock = await MediaBlocksService.update(mediaBlock, newMediaBlock, req.file)

  res.status(200).send({ mediaBlock: mediaBlock })
}

exports.deleteMediaBlocks = async (req, res, next) => {
  if (req.query && req.query.status !== 'untranslated') {
    res.status(422).send('Missing query parameters')
  }

  const result = await MediaBlocksService.deleteUntranslatedMediaBlocks()

  res.status(200).send({
    result
  })
}
