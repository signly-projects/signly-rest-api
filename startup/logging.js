require('express-async-errors')
const winston = require('winston')
const config = require('../config')
// require('winston-mongodb')

module.exports = function () {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  })

  const { env } = config

  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  if (env !== 'prod') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }))
  }
}
