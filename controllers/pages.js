const { validatePage } = require('~models/page')

const SiteService = require('~services/sites.service')
const PageService = require('~services/pages.service')
const MediaBlockService = require('~services/media-blocks.service')

exports.getPages = async (req, res, next) => {
  const result = await PageService.findAll(req.query)

  res.status(200).send({ pages: result.pages, count: result.count })
}

exports.getPageByUri = async (req, res, next) => {
  const page = await PageService.findByUri(decodeURIComponent(req.query.uri), true)

  if (!page) {
    return res.status(404).send('Page with the given URI not found.')
  }

  res.status(200).send({ page: page })
}

exports.getPage = async (req, res, next) => {
  const page = await PageService.findById(req.params.id, true)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ page: page })
}

exports.createPage = async (req, res, next) => {
  const newPage = req.body.page
  const { error } = validatePage(newPage)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let page = await PageService.findByUri(decodeURIComponent(newPage.uri))
  let mediaBlocks = await MediaBlockService.findOrCreateMediaBlocks(newPage, page)

  if (!page) {
    let page = await PageService.create(newPage, mediaBlocks)
    await SiteService.findOrCreate(page.uri, page._id)
    return res.status(201).send({ page: page })
  }

  await SiteService.findOrCreate(page.uri, page._id)

  page = await PageService.updateRequest(page, mediaBlocks)

  res.status(200).send({ page: page })
}

exports.patchPage = async (req, res, next) => {
  const newPage = req.body.page
  const { error } = validatePage(newPage, 'update')

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let page = await PageService.findById(decodeURIComponent(req.params.id))

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  let mediaBlocks = await MediaBlockService.findOrCreateMediaBlocks(newPage, page)

  page = await PageService.update(page, newPage, mediaBlocks)
  res.status(200).send({ page: page })
}

exports.deletePage = async (req, res, next) => {
  const page = await PageService.delete(req.params.id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ page: page })
}
