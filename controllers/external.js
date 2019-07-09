const { headlessWebCrawler } = require('../services/headless-web-crawler')
const axios = require('axios')

exports.getExternalPage = async (req, res, next) => {
  const pageUri = decodeURIComponent(req.query.uri)

  if (!pageUri) {
    return res.status(422).send('External page URI not specified.')
  }

  try {
    await axios.get(pageUri, { timeout: 5000 })
  } catch (error) {
    return res.status(404).send('External page with the given URI not found.')
  }

  let externalPages = await headlessWebCrawler(pageUri)

  res.status(200).send({ externalPage: externalPages[0] })
}
