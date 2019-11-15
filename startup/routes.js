const bodyParser = require('body-parser')
const pages = require('~routes/pages')
const mediaBlocks = require('~routes/media-blocks')
const status = require('~routes/status')
const header = require('~middleware/header')
const error = require('~middleware/error')

module.exports = function (app) {
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
  app.use(bodyParser.json({ limit: '10mb', extended: true }))
  app.use(header)

  app.use('/api/pages', pages)
  app.use('/api/media-blocks', mediaBlocks)

  app.use('/api/status', status)

  app.use(error)
}
