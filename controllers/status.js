exports.getStatus = async (req, res, next) => {
  res.status(200).send({ status: 'Running' })
}
