const { validationResult } = require('express-validator/check')
const Site = require('../models/site')

exports.getSites = (req, res, next) => {
  Site.fetchAll()
    .then(sites => {
      res.status(200).json({ sites: sites })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}

exports.getSite = (req, res, next) => {
  const siteId = req.params.siteId

  Site.findById(siteId)
    .then(site => {
      res.status(200).json({ site: site })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
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

  const title = req.body.title
  const url = req.body.url

  const site = new Site(title, url)

  site
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Site created successfully.',
        site: result
      })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
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

  const updatedSite = new Site(title, url, siteId)

  updatedSite
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Site updated successfully.',
        site: result
      })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}
