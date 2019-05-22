const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

require('dotenv').config()

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

mongoose
  .connect(
    `mongodb://${process.env.COSMOSDB_ACCOUNT}:${process.env.COSMOSDB_KEY}@${process.env.COSMOSDB_ACCOUNT}.documents.azure.com:${process.env.COSMOSDB_PORT}/${process.env.COSMOSDB_DB}?ssl=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(process.env.SERVER_PORT)
  })
  .catch(err => {
    // eslint-disable-next-line no-console
    console.log(err)
  })
