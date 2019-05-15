const express = require('express')
const bodyParser = require('body-parser')

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

app.listen(8080)
