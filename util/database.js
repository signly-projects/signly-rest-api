const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const mongoConnect = callback => {
  MongoClient.connect(
    `mongodb://${process.env.COSMOSDB_ACCOUNT}:${process.env.COSMOSDB_KEY}@${process.env.COSMOSDB_ACCOUNT}.documents.azure.com:${process.env.COSMOSDB_PORT}/?ssl=true`,
    { useNewUrlParser: true }
  )
    .then(client => {
      // eslint-disable-next-line no-console
      console.log('Connected.')
      callback(client)
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })
}

module.exports = mongoConnect
