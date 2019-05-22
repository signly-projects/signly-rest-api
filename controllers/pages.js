const { validationResult } = require('express-validator/check')
const Page = require('../models/page')

exports.getPages = (req, res, next) => {
  Page.find()
    .then(pages => {
      res.status(200).json({ pages: pages })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getPage = (req, res, next) => {
  const pageId = req.params.pageId

  Page.findById(pageId)
    .then(page => {
      res.status(200).json({ page: page })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.createPage = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Web page create validation failed. Request data is incorrect.',
        errors: errors.array()
      })
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.updatePage = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Web page update validation failed. Request data is incorrect.',
        errors: errors.array()
      })
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}