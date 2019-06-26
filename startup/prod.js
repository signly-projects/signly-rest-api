const helmet = require('helmet')
const compression = require('compression')

exports = function (app) {
  app.use(helmet())
  app.use(compression())
}
