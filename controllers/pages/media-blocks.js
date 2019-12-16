const { Page } = require('~models/page')
const PageService = require('~services/pages.service')

exports.getPageMediaBlocks = async (req, res, next) => {
  const page = await Page.findById(req.params.pageId).populate('mediaBlocks')

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ mediaBlocks: page.mediaBlocks })
}

exports.deletePageMediaBlock = async (req, res, next) => {
  const page = await Page.findById(req.params.pageId)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  const mediaBlockIdIndex = page.mediaBlocks.indexOf(req.params.id)

  if (mediaBlockIdIndex < 0) {
    return res.status(404).send('Media block with the given ID not found.')
  }

  await PageService.deleteMediaBlock(req.params.pageId, req.params.id)

  res.status(200).send({ mediaBlockId: req.params.id })
}
