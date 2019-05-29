require('express-async-errors')
const winston = require('winston')
const config = require('../config')

module.exports = function () {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.prettyPrint(),
          winston.format.colorize()
        )
      })
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: 'logs/uncaught-exceptions.log' })
    ]
  })

  process.on('unhandledRejection', (exception) => {
    throw exception
  })

  const { env } = config

  logger.add(new winston.transports.File({ filename: `logs/${env}.log` }))
}
