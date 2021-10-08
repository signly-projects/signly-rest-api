const PageService = require('~services/pages.service')

exports.getCrossCountryMediaBlocks = async (req, res, next) => {
  const crossCountryPage = 'https://signly.co/cross-country/'
  const page = await PageService.findByUri(crossCountryPage, true)

  if (!page) {
    return res.status(404).send('Page https://signly.co/cross-country/ not found.')
  }

  res.status(200).send({ textSegments: page && page.mediaBlocks })
}
