const express = require('express')
const pages = require('../routes/pages')
const header = require('../middleware/header')
const error = require('../middleware/error')

module.exports = function (app) {
  app.use(express.json({ limit: '300kb' }))
  app.use(header)
  app.use('/api/pages', pages)

  app.use(error)
}