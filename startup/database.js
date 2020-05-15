require('dotenv').config()
const mongoose = require('mongoose')
const winston = require('winston')

module.exports = function () {
  const env = process.env.NODE_ENV
  const databaseProtocol = process.env.DATABASE_PROTOCOL
  const databaseName = `${process.env.DATABASE_NAME}_${env}`
  const databasePort = process.env.DATABASE_PORT
  const databaseHost = process.env.DATABASE_HOST
  const cosmosdbAccount = process.env.COSMOSDB_ACCOUNT
  const cosmosdbKey = process.env.COSMOSDB_KEY


  let mongoUri

  if (env === 'prod' || env === 'stag' || env === 'dev') {
    mongoUri = `${databaseProtocol}://${cosmosdbAccount}:${cosmosdbKey}@${databaseHost}:${databasePort}/${databaseName}?ssl=true`
  } else {
    mongoUri = `${databaseProtocol}://${databaseHost}:${databasePort}/${databaseName}`
  }

  const options = {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
    useFindAndModify: false
  }

  mongoose
    .connect(mongoUri, options)
    .then(() => winston.info(`Connected to ${mongoUri}...`))
}
