const { Page } = require('~models/page')
const { MediaBlock } = require('~models/media-block')

const MAX_ITEMS = 100

const getPagesWithMediaBlocks = async (queryParams, options) => {
  const query = {
    $and: [
      {
        rawText: {
          $regex: queryParams.search || '',
          $options: 'i'
        }
      }
    ]
  }

  if (queryParams.mediaBlocksStatus) {
    query.$and.push({ status: queryParams.mediaBlocksStatus })
  }

  let pages = await Page
    .find({
      mediaBlocks: { $exists: true },
      $where: 'this.mediaBlocks.length>0'
    })
    .sort(options.sort)
    .populate({
      path: 'mediaBlocks',
      model: MediaBlock,
      options: {
        sort: { updatedAt: 'asc' }
      },
      match: query
    })

  pages = pages.filter(page => page.mediaBlocks.length > 0)
  pages = pages.slice(0, queryParams.limit)

  return pages
}

exports.countAll = async () => {
  return Page.countDocuments()
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

exports.deleteMediaBlock = async (pageId, mediaBlockId) => {
  const page = await Page.findById(pageId)

  const mediaBlockIdIndex = page.mediaBlocks.indexOf(mediaBlockId)

  if (mediaBlockIdIndex >= 0) {
    page.mediaBlocks.splice(mediaBlockIdIndex, 1)
  }

  return await page.save()
}
