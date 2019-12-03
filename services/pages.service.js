const { Page } = require('~models/page')

const MAX_ITEMS = 100

const getPagesWithMediaBlocks = async (query, options) => {
  let pages = await Page
    .find()
    .limit(options.limit)
    .sort(options.sort).populate({
      path: 'mediaBlocks',
      options: {
        sort: { updatedAt: 'asc' }
      },
      match: {
        rawText: {
          $regex: query.search || '',
          $options: 'i'
        }
      }
    })

  if (query.mediaBlocksStatus && query.mediaBlocksStatus === 'untranslated') {
    pages.forEach(page => {
      page.mediaBlocks = page.mediaBlocks.filter(mediaBlock => mediaBlock.status === 'untranslated')
    })

    pages = pages.filter(page => page.mediaBlocks.length > 0)
  }

  return pages
}

exports.countAll = async () => {
  return await Page.count({})
}

exports.findAll = async (query) => {
  let options = {
    sort: {
      requested: 'desc'
    },
    limit: query.limit ? parseInt(query.limit, 10) : MAX_ITEMS
  }

  if (query.withMediaBlocks) {
    return await getPagesWithMediaBlocks(query, options)
  }

  return await Page.find().limit(options.limit).sort(options.sort)
}

exports.findByUri = async (uri, withMediaBlocks = false) => {
  if (withMediaBlocks) {
    return Page.findOne({ uri: uri }).populate('mediaBlocks')
  }

  return Page.findOne({ uri: uri })
}

exports.findById = async (pageId, withMediaBlocks = false) => {
  if (withMediaBlocks) {
    return Page.findById(pageId).populate('mediaBlocks')
  }

  return Page.findById(pageId)
}

exports.create = async (newPage, mediaBlocks) => {
  let page = new Page({
    requested: newPage.requested,
    enabled: newPage.hasOwnProperty('enabled') ? newPage.enabled : false,
    title: newPage.title,
    uri: newPage.uri,
    mediaBlocks: mediaBlocks
  })

  return await page.save()
}

exports.update = async (page, newPage, mediaBlocks) => {
  page.title = newPage.title || page.title
  page.uri = newPage.uri || page.uri
  page.enabled = newPage.hasOwnProperty('enabled') ? newPage.enabled : page.enabled
  page.mediaBlocks.push(...mediaBlocks)

  return await page.save()
}

exports.updateRequest = async (page, mediaBlocks) => {
  page.requested += 1
  page.mediaBlocks.push(...mediaBlocks)

  return await page.save()
}

exports.delete = async (pageId) => {
  return Page.findByIdAndDelete(pageId)
}
