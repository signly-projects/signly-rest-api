const { validatePage } = require('~models/page')

const SiteService = require('~services/sites.service')
const PageService = require('~services/pages.service')
const MediaBlocksService = require('~services/media-blocks.service')

exports.getPages = async (req, res, next) => {
  const pages = await PageService.findAll(req.query)
  const totalPagesCount = await PageService.countAll(req.query)

  res.status(200).send({ pages: pages, count: totalPagesCount })
}

exports.getPageByUri = async (req, res, next) => {
  let site = await SiteService.findByPageUrl(req.query.uri)

  if (site && !site.active) {
    return res.status(404).send('Site for the requested page is not active.')
  }

  let page = await PageService.findByUri(decodeURIComponent(req.query.uri), true)

  if (!page) {
    return res.status(404).send('Page with the given URI not found.')
  }

  page = await PageService.incrementVisits(page)

  res.status(200).send({ page: page })
}

exports.getPage = async (req, res, next) => {
  const withMediaBlocks = true
  const page = await PageService.findById(req.params.id, withMediaBlocks, req.query.status)

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

  let site = await SiteService.findOrCreate(newPage.uri)

  if (!site.active) {
    return res.status(401).send('Website not authorized')
  }

  let page = await PageService.findByUri(decodeURIComponent(newPage.uri))
  const newMediaBlocks = await MediaBlocksService.findOrCreateNewMediaBlocks(newPage, page)

  if (!page) {
    let page = await PageService.create(newPage, newMediaBlocks)
    page = await PageService.indexMediaBlocks(page, newPage)

    await SiteService.addPageToSite(site, page._id)

    return res.status(201).send({ page: page })
  }

  page = await PageService.update(page, newPage, newMediaBlocks)
  page = await PageService.indexMediaBlocks(page, newPage)

  await SiteService.addPageToSite(site, page._id)

  res.status(200).send({ page: page })
}

exports.setPageAsUntranslated = async (req, res, next) => {
  let page = await PageService.findOneByMediaBlockId(req.body.mediaBlockId)

  if (!page) {
    return res.status(404).send('No pages with given media block id found')
  }

  const hasUntranslatedMediaBlocks = page.mediaBlocks.some(mb => mb.status === 'untranslated')

  if (hasUntranslatedMediaBlocks) {
    page = await PageService.update(page, { translated: false }, [])
  }

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

  let newMediaBlocks = await MediaBlocksService.findOrCreateNewMediaBlocks(newPage, page)

  page = await PageService.update(page, newPage, newMediaBlocks)
  res.status(200).send({ page: page })
}

exports.deletePage = async (req, res, next) => {
  const page = await PageService.delete(req.params.id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ page: page })
}

/* LATEST FUNCTIONS */

exports.getStudioPages = async (req, res, next) => {
  const { pages, totalPages } = await PageService.findAllWithUntranslatedMediablocks(req.query)
  const untranslatedMediaBlocks = new Set()

  for (let i = 0; i < pages.length; i++) {
    untranslatedMediaBlocks.add(...pages[i].mediaBlocks.map(mb => mb._id))
  }

  res.status(200).send({
    pages: pages,
    pageCount: totalPages,
    untranslatedMediaBlockCount: untranslatedMediaBlocks.size
  })
}

exports.getStudioPageCount = async (req, res, next) => {
  const { pageCount, untranslatedMediaBlockCount, untranslatedWordCount } = await PageService.countAllUntranslatedMediablocks()

  res.status(200).send({
    pageCount,
    untranslatedMediaBlockCount,
    untranslatedWordCount
  })
}
