const winston = require('winston')
const express = require('express')
const config = require('./config')

const app = express()

require('./startup/logging')()
require('./startup/routes')(app)
require('./startup/database')()
require('./startup/validation')()

const { port } = config

const server = app.listen(port, () => winston.info(`Listening on port ${port}...`))

module.exports = server
