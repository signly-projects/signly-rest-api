module.exports = function (req, res, next) {
  req.params.uri = decodeURI(req.params.uri)
  try {
    new URL(req.params.uri)
  } catch (err) {
    return res.status(404).send('Invalid page URI.')
  }
  next()
}