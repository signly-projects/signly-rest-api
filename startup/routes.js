const bodyParser = require('body-parser')
const pagesPrivate = require('~routes/private/pages')
const mediaBlocksPrivate = require('~routes/private/media-blocks')
const pagesPublic = require('~routes/public/pages')
const statusPublic = require('~routes/public/status')
const header = require('~middleware/header')
const error = require('~middleware/error')

module.exports = function (app) {
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
  app.use(bodyParser.json({ limit: '10mb', extended: true }))
  app.use(header)

  /* PRIVATE ROUTES */
  app.use('/api/private/pages', pagesPrivate)
  app.use('/api/private/media-blocks', mediaBlocksPrivate)

  /* PUBLIC ROUTES */
  app.use('/api/public/pages', pagesPublic)
  app.use('/api/public/status', statusPublic)

  app.use(error)
}
