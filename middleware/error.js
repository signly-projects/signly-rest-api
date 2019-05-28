module.exports = (error, req, res, next) => {
  const httpStatusCode = error.httpStatusCode || 500

  res.status(httpStatusCode).json({
    message: error.message,
    errors: error.details
  })
}