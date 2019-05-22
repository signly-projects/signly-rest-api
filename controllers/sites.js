const { validationResult } = require('express-validator/check')
const Site = require('../models/site')

exports.getSites = (req, res, next) => {
  Site.find()
    .then(sites => {
      res.status(200).json({ sites: sites })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.getSite = (req, res, next) => {
  const siteId = req.params.siteId

  Site.findById(siteId)
    .then(site => {
      res.status(200).json({ site: site })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.createSite = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Site create validation failed. Request data is incorrect.')
    error.httpStatusCode = 422
    error.details = errors.array()
    throw error
  }

  const site = new Site({
    title: req.body.title,
    url: req.body.url
  })

  site
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Site created successfully.',
        site: result
      })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.updateSite = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Site update validation failed. Request data is incorrect.')
    error.httpStatusCode = 422
    error.details = errors.array()
    throw error
  }

  const siteId = req.params.siteId
  const title = req.body.title
  const url = req.body.url

  Site.findById(siteId)
    .then(site => {
      site.title = title
      site.url = url
      site.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Site updated successfully.',
        site: result
      })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}

exports.deleteSite = (req, res, next) => {
  const siteId = req.params.siteId

  Site.findByIdAndRemove(siteId)
    .then(() => {
      res.status(204).json({
        message: 'Site deleted successfully.'
      })
    })
    .catch(err => {
      if (!err.httpStatusCode) {
        err.httpStatusCode = 500
      }
      next(err)
    })
}