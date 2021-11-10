const { validateMediaBlock } = require('~models/media-block')

const PageService = require('~services/pages.service')
const MediaBlocksService = require('~services/media-blocks.service')

exports.getCrossCountryMediaBlocks = async (req, res, next) => {
  const crossCountryPage = 'https://signly.co/cross-country/'
  const page = await PageService.findByUri(crossCountryPage, true)

  if (!page) {
    return res.status(404).send('Page https://signly.co/cross-country/ not found.')
  }

  const mediaBlocks = page.mediaBlocks
    .filter(mb => mb.status === 'translated')
    .map(
      (mb, index) => {
        return { id: index, name: mb.rawText, video: mb.video.uri }
      }
    )

  res.status(200).send({ textSegments: mediaBlocks })
}

exports.createCrossCountryMediaBlock = async (req, res, next) => {
  const newMediaBlock = req.body.mediaBlock
  const { error } = validateMediaBlock(newMediaBlock)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  const mediaBlock = await MediaBlocksService.findOrCreate(newMediaBlock)
  let page = await PageService.findByUri('https://signly.co/cross-country/', false)

  if (!page) {
    return res.status(404).send('Page https://signly.co/cross-country/ not found.')
  }

  page = await PageService.addMediaBlockToPage(page, mediaBlock)

  if (!page) {
    return res.status(422).send('Media block could not be added to page.')
  }

  res.status(200).send({ textSegment: mediaBlock })
}
