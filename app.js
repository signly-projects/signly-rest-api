const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const config = require('./config')

const pagesRoutes = require('./routes/pages')
const sitesRoutes = require('./routes/sites')
const mediaBlocksRoutes = require('./routes/media-blocks')

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/api', pagesRoutes)
app.use('/api', sitesRoutes)
app.use('/api', mediaBlocksRoutes)

app.use((error, req, res, next) => {
  const httpStatusCode = error.httpStatusCode || 500
  const message = error.message

  res.status(httpStatusCode).json({
    message: message,
    errors: error.details
  })
})

const { env, port, database, cosmosdb } = config

let mongoUri = ''

if (env === 'prod' || env === 'stag') {
  mongoUri = `${database.protocol}://${cosmosdb.account}:${cosmosdb.key}@${database.host}:${database.port}/${database.name}?ssl=true`
} else {
  mongoUri = `${database.protocol}://${database.host}:${database.port}/${database.name}`
}

mongoose
  .connect(mongoUri, { useNewUrlParser: true })
  .then(() => {
    app.listen(port)
  })
  .catch(err => {
    // eslint-disable-next-line no-console
    console.log(err)
  })
