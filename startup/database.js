const mongoose = require('mongoose')
const winston = require('winston')
const config = require('../config')

module.exports = function () {
  const { env, database, cosmosdb } = config

  let mongoUri

  if (env === 'prod' || env === 'stag' || env === 'dev') {
    mongoUri = `${database.protocol}://${cosmosdb.account}:${cosmosdb.key}@${database.host}:${database.port}/${database.name}?ssl=true`
  } else {
    mongoUri = `${database.protocol}://${database.host}:${database.port}/${database.name}`
  }

  mongoose
    .connect(mongoUri, { useNewUrlParser: true, useFindAndModify: false })
    .then(() => winston.info(`Connected to ${mongoUri}...`))
}