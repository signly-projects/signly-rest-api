const bodyParser = require('body-parser')
const sitesPrivate = require('~routes/v1/private/sites')
const pagesPrivate = require('~routes/v1/private/pages')
const mediaBlocksPrivate = require('~routes/v1/private/media-blocks')
const pagesPublic = require('~routes/v1/public/pages')
const statusPublic = require('~routes/v1/public/status')
const signItPublic = require('~routes/v1/public/signit')
const header = require('~middleware/header')
const error = require('~middleware/error')
const json2xls = require('json2xls')

module.exports = function (app) {
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
  app.use(bodyParser.json({ limit: '10mb', extended: true }))
  app.use(header)
  app.use(json2xls.middleware)

  /* PRIVATE ROUTES */
  app.use('/api/v1/private/sites', sitesPrivate)
  app.use('/api/v1/private/pages', pagesPrivate)
  app.use('/api/v1/private/media-blocks', mediaBlocksPrivate)

  /* PUBLIC ROUTES */
  app.use('/api/v1/public/pages', pagesPublic)
  app.use('/api/v1/public/status', statusPublic)

  app.use('/api/v1/public/media-blocks', mediaBlocksPrivate)
  app.use('/api/v1/public/signit', signItPublic)

  app.use(error)
}
