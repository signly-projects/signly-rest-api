require('express-async-errors')
const express = require('express')
const config = require('./config')

const app = express()

require('./startup/routes')(app)
require('./startup/database')()

const { port } = config

const server = app.listen(port, () => console.log(`Listening on port ${port}...`))

module.exports = server
