const winston = require('winston')

module.exports = (err, req, res, next) => {
  winston.error(err.message)

  res.status(500).send('Server error. Check logs for details.')
}
