const { validationResult } = require('express-validator/check')

const MediaBlock = require('../../models/media-block')

exports.getMediaBlocks = (req, res, next) => {
  MediaBlock.fetchAll()
    .then(mediaBlocks => {
      res.status(200).json({ mediaBlocks: mediaBlocks })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}

exports.getMediaBlock = (req, res, next) => {
  const mediaBlockId = req.params.mediaBlockId

  MediaBlock.findById(mediaBlockId)
    .then(mediaBlock => {
      res.status(200).json({ mediaBlock: mediaBlock })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}

exports.createMediaBlock = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Media block create validation failed. Request data is incorrect.',
        errors: errors.array()
      })
  }

  const mediaBlock = new MediaBlock(req.body.transcript)
  mediaBlock
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Media block created successfully.',
        mediaBlock: result
      })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}
