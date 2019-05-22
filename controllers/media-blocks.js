const { validationResult } = require('express-validator/check')
const MediaBlock = require('../models/media-block')

exports.getMediaBlocks = (req, res, next) => {
  MediaBlock.find()
    .then(mediaBlocks => {
      res.status(200).json({ mediaBlocks: mediaBlocks })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getMediaBlock = (req, res, next) => {
  const mediaBlockId = req.params.mediaBlockId

  MediaBlock.findById(mediaBlockId)
    .then(mediaBlock => {
      res.status(200).json({ mediaBlock: mediaBlock })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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

  const mediaBlock = new MediaBlock({
    transcript: req.body.transcript
  })

  mediaBlock
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Media block created successfully.',
        mediaBlock: result
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.updateMediaBlock = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Web media block update validation failed. Request data is incorrect.',
        errors: errors.array()
      })
  }

  const mediaBlockId = req.params.mediaBlockId
  const transcript = req.body.transcript

  MediaBlock.findById(mediaBlockId)
    .then(mediaBlock => {
      mediaBlock.transcript = transcript
      return mediaBlock.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Media block updated successfully.',
        mediaBlock: result
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.deleteMediaBlock = (req, res, next) => {
  const mediaBlockId = req.params.mediaBlockId

  MediaBlock.findByIdAndRemove(mediaBlockId)
    .then(() => {
      res.status(204).json({
        message: 'Media block deleted successfully.'
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}