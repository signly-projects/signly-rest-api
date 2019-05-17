const { validationResult } = require('express-validator/check')

const Page = require('../../models/page')

exports.getPages = (req, res, next) => {
  Page.fetchAll()
    .then(pages => {
      res.status(200).json({ pages: pages })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
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

  const page = new Page(req.body.url)

  page
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Page created successfully.',
        page: result
      })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}
