require('express-async-errors')
const winston = require('winston')
const { format } = require('winston')
const config = require('../config')

module.exports = function () {
  const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.prettyPrint(),
      format.splat(),
      format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    exceptionHandlers: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/uncaught-exceptions.log' }),
    ]
  })

  process.on('unhandledRejection', (exception) => {
    throw exception
  })

  const { env } = config

  logger.add(new winston.transports.File({
    filename: `logs/${env}.log`
  }))
}
