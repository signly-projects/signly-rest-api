const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const config = require('./config')
const database = require('./utils/database')

const pagesRoutes = require('./routes/pages')

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/api', pagesRoutes)

app.use((error, req, res, next) => {
  const httpStatusCode = error.httpStatusCode || 500
  const message = error.message

  res.status(httpStatusCode).json({
    message: message,
    errors: error.details
  })
})

const port = config

mongoose
  .connect(
    database.mongoUri(),
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(port)
  })
  .catch(err => {
    // eslint-disable-next-line no-console
    console.log(err)
  })
