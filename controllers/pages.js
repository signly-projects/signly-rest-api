const { validationResult } = require('express-validator/check')
const Page = require('../models/page')

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

exports.getPage = (req, res, next) => {
  const pageId = req.params.pageId

  Page.findById(pageId)
    .then(page => {
      res.status(200).json({ page: page })
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

  const updatedPage = new Page(url, pageId)

  updatedPage
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Page updated successfully.',
        page: result
      })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}

exports.deletePage = (req, res, next) => {
  const pageId = req.params.pageId

  Page.deleteById(pageId)
    .then(() => {
      res.status(204).json({
        message: 'Page deleted successfully.'
      })
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}