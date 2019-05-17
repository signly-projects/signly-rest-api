const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db

const mongoConnect = callback => {
  MongoClient.connect(
    `mongodb://${process.env.COSMOSDB_ACCOUNT}:${process.env.COSMOSDB_KEY}@${process.env.COSMOSDB_ACCOUNT}.documents.azure.com:${process.env.COSMOSDB_PORT}/${process.env.COSMOSDB_DB}?ssl=true`,
    { useNewUrlParser: true }
  )
    .then(client => {
      // eslint-disable-next-line no-console
      console.log('Connected.')
      _db = client.db()
      callback(client)
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}

const getDb = () => {
  if (_db) {
    return _db
  }
  throw Error(`Databas '${process.env.COSMOSDB_DB}' not found.`)
}

module.exports = {
  mongoConnect,
  getDb
}
