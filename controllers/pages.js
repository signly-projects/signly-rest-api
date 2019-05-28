const { Page, validate } = require('../models/page')

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
      if (!page) {
        const error = new Error('Page not found.')
        error.httpStatusCode = 404
        throw error
      }

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
  const validation = validate(req.body)

  if (validation.error) {
    const error = new Error('Page create validation failed. Request data is incorrect.')
    error.httpStatusCode = 422
    error.details = validation.error.details
    throw error
  }

  const uri = req.body.uri

  Page.findOne({ uri: uri })
    .then(page => {
      page.requested += 1

      page.save()
    })
    .then(result => {
      res.status(204).json({
        message: 'Page updated successfully.',
        page: result
      })
    })
    .catch(() => {
      const page = new Page({
        uri: uri
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
    })

}

exports.updatePage = (req, res, next) => {
  const error = validate(req.body)

  if (error) {
    error.httpStatusCode = 422
    throw error
  }

  const pageId = req.params.pageId
  const uri = req.body.uri

  Page.findById(pageId)
    .then(page => {
      if (!page) {
        const error = new Error('Page not found.')
        error.httpStatusCode = 404
        throw error
      }

      page.uri = uri
      return page.save()
    })
    .then(result => {
      res.status(204).json({
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

  Page.findById(pageId)
    .then(page => {
      if (!page) {
        const error = new Error('Page not found.')
        error.httpStatusCode = 404
        throw error
      }

      return Page.findByIdAndDelete(pageId)
    })
    .then(() => {
      res.status(200).json({
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