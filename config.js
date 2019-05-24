require('dotenv').config()
const convict = require('convict')

const config = convict({
  env: {
    doc: 'The application evironment',
    format: ['prod', 'stag', 'dev', 'dev-local', 'test'],
    default: 'development',
    env: 'NODE_ENV',
    arg: 'env'
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 8080,
    env: 'PORT'
  },
  host: {
    doc: 'The host to bind',
    format: '*',
    default: 'localhost',
    env: 'HOST'
  },
  database: {
    name: {
      doc: 'Database name',
      format: String,
      default: 'signly-dev',
      env: 'DATABASE_NAME'
    },
    port: {
      doc: 'Database port',
      format: 'port',
      default: 27017,
      env: 'DATABASE_PORT'
    },
    host: {
      doc: 'Database host',
      format: '*',
      default: 'localhost',
      env: 'DATABASE_HOST'
    },
    protocol: {
      doc: 'Database host',
      format: '*',
      default: 'mongodb',
      env: 'DATABASE_PROTOCOL'
    }
  },
  cosmosdb: {
    account: {
      doc: 'CosmosDB account name',
      format: '*',
      default: null,
      env: 'COSMOSDB_ACCOUNT'
    },
    key: {
      doc: 'CosmosDB key',
      format: '*',
      default: null,
      env: 'COSMOSDB_KEY'
    }
  }
})

const env = config.get('env')
config.loadFile(`./config/${env}.json`)
config.validate({ allowed: 'strict' })

module.exports = config.getProperties()