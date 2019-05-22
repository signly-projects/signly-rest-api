const { validationResult } = require('express-validator/check')
const Site = require('../models/site')

exports.getSites = (req, res, next) => {
  Site.find()
    .then(sites => {
      res.status(200).json({ sites: sites })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getSite = (req, res, next) => {
  const siteId = req.params.siteId

  Site.findById(siteId)
    .then(site => {
      res.status(200).json({ site: site })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.createSite = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Web site create validation failed. Request data is incorrect.',
        errors: errors.array()
      })
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.updateSite = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Web site update validation failed. Request data is incorrect.',
        errors: errors.array()
      })
  }

  const siteId = req.params.siteId
  const title = req.body.title
  const url = req.body.url

  Site.findById(siteId)
    .then(site => {
      site.title = title
      site.url = url
      return site.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Site updated successfully.',
        site: result
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}