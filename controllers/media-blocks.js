const { validationResult } = require('express-validator/check')
const MediaBlock = require('../models/media-block')

exports.getMediaBlocks = (req, res, next) => {
  MediaBlock.find()
    .then(mediaBlocks => {
      res.status(200).json({ mediaBlocks: mediaBlocks })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.getMediaBlock = (req, res, next) => {
  const mediaBlockId = req.params.mediaBlockId

  MediaBlock.findById(mediaBlockId)
    .then(mediaBlock => {
      if (!mediaBlock) {
        const error = new Error('Media block not found.')
        error.httpStatusCode = 404
        throw error
      }

      res.status(200).json({ mediaBlock: mediaBlock })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.createMediaBlock = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Media block create validation failed. Request data is incorrect.')
    error.httpStatusCode = 422
    error.details = errors.array()
    throw error
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
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.updateMediaBlock = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Media block update validation failed. Request data is incorrect.')
    error.httpStatusCode = 422
    error.details = errors.array()
    throw error
  }

  const mediaBlockId = req.params.mediaBlockId
  const transcript = req.body.transcript

  MediaBlock.findById(mediaBlockId)
    .then(mediaBlock => {
      if (!mediaBlock) {
        const error = new Error('Media block not found.')
        error.httpStatusCode = 404
        throw error
      }

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
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.deleteMediaBlock = (req, res, next) => {
  const mediaBlockId = req.params.mediaBlockId

  MediaBlock.findById(mediaBlockId)
    .then(mediaBlock => {
      if (!mediaBlock) {
        const error = new Error('Media block not found.')
        error.httpStatusCode = 404
        throw error
      }

      return MediaBlock.findByIdAndDelete(mediaBlockId)
    })
    .then(() => {
      res.status(200).json({
        message: 'Media block deleted successfully.'
      })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}