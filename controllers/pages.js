const { validationResult } = require('express-validator/check')
const Page = require('../models/page')

exports.getPages = (req, res, next) => {
  Page.find()
    .then(pages => {
      res.status(200).json({ pages: pages })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.getPage = (req, res, next) => {
  const pageId = req.params.pageId

  Page.findById(pageId)
    .then(page => {
      res.status(200).json({ page: page })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.createPage = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Page create validation failed. Request data is incorrect.')
    error.httpStatusCode = 422
    error.details = errors.array()
    throw error
  }

  const page = new Page({
    url: req.body.url
  })

  page
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Page created successfully.',
        page: result
      })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.updatePage = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Page update validation failed. Request data is incorrect.')
    error.httpStatusCode = 422
    error.details = errors.array()
    throw error
  }

  const pageId = req.params.pageId
  const url = req.body.url

  Page.findById(pageId)
    .then(page => {
      page.url = url
      return page.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Page updated successfully.',
        page: result
      })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.deletePage = (req, res, next) => {
  const pageId = req.params.pageId

  Page.findByIdAndRemove(pageId)
    .then(() => {
      res.status(204).json({
        message: 'Page deleted successfully.'
      })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}