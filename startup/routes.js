const bodyParser = require('body-parser')
const pagesPrivate = require('~routes/v1/private/pages')
const mediaBlocksPrivate = require('~routes/v1/private/media-blocks')
const pagesPublic = require('~routes/v1/public/pages')
const statusPublic = require('~routes/v1/public/status')
const header = require('~middleware/header')
const error = require('~middleware/error')

module.exports = function (app) {
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
  app.use(bodyParser.json({ limit: '10mb', extended: true }))
  app.use(header)

  /* TO DELETE AFTER EXTENSION UPDATE TO USE PUBLIC ONLY */
  app.use('/api/pages', pagesPrivate)
  app.use('/api/media-blocks', mediaBlocksPrivate)
  app.use('/api/status', statusPublic)

  /* PRIVATE ROUTES */
  app.use('/api/v1/private/pages', pagesPrivate)
  app.use('/api/v1/private/media-blocks', mediaBlocksPrivate)

  /* PUBLIC ROUTES */
  app.use('/api/v1/public/pages', pagesPublic)
  app.use('/api/v1/public/status', statusPublic)

  app.use(error)
}
