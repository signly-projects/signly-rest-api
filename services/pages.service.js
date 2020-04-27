const safe = require('safe-regex')
const { Page } = require('~models/page')
const { MediaBlock } = require('~models/media-block')

const MAX_ITEMS = 200

const getPagesWithMediaBlocks = async (queryParams, options) => {
  if (!safe) {
    return []
  }

  const query = {
    $and: []
  }

  if (queryParams.search) {
    query.$and.push(
      {
        rawText: {
          $regex: queryParams.search || '',
          $options: 'i'
        }
      }
    )
  }

  if (queryParams.mediaBlocksStatus) {
    if (typeof queryParams.mediaBlocksStatus === 'string' || queryParams.mediaBlocksStatus instanceof String) {
      query.$and.push({ status: queryParams.mediaBlocksStatus })
    } else if (Array.isArray(queryParams.mediaBlocksStatus)) {
      const statuses = queryParams.mediaBlocksStatus.map(status => { return { status: status } })
      query.$and.push({ $or: statuses })
    }
  }

  let pages = await Page
    .find()
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
  return await Page.update(
    { _id: pageId },
    { $pull: { mediaBlocks: mediaBlockId } },
    { multi: true }
  )
}
