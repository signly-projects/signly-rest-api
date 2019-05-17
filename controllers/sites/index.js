const { validationResult } = require('express-validator/check')

const Site = require('../../models/site')

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

  const site = new Site(req.body.title, req.body.url)

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
