const config = require('../config')

exports.mongoUri = () => {
  const { env, database, cosmosdb } = config

  if (env === 'prod' || env === 'stag' || env === 'dev') {
    return `${database.protocol}://${cosmosdb.account}:${cosmosdb.key}@${database.host}:${database.port}/${database.name}?ssl=true`
  } else {
    return `${database.protocol}://${database.host}:${database.port}/${database.name}`
  }
}

