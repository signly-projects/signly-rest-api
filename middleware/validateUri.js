module.exports = function (req, res, next) {
  const uri = decodeURIComponent(req.query.uri)
  try {
    new URL(uri)
  } catch (err) {
    return res.status(404).send('Invalid page URI.')
  }
  next()
}
