const mongoose = require('mongoose')
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
    .connect(
      mongoUri,
      { useNewUrlParser: true }
    )
    .then(() => {
      // eslint-disable-next-line no-console
      console.log(`Connected to ${mongoUri}...`)
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}