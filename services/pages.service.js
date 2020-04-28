const safe = require('safe-regex')
const { Page } = require('~models/page')

const MAX_ITEMS = 200

const getSearchQuery = (search) => {
  if (!safe(search)) {
    return []
  }

  return {
    $and: [
      {
        uri: {
          $regex: search || '',
          $options: 'i'
        }
      }
    ]
  }
}

const getPagesWithMediaBlocks = async (query) => {
  const { limit, page, search, mediaBlocksStatus } = query
  const itemLimit = limit ? parseInt(limit, 10) : MAX_ITEMS
  const searchQuery = search ? getSearchQuery(search) : {}

  const mediaBlocksQuery = { $and: [] }

  if (mediaBlocksStatus.length) {
    if (typeof mediaBlocksStatus === 'string' || mediaBlocksStatus instanceof String) {
      mediaBlocksQuery.$and.push({ status: mediaBlocksStatus })
    } else if (Array.isArray(mediaBlocksStatus)) {
      const statuses = mediaBlocksStatus.map(status => { return { status: status } })
      mediaBlocksQuery.$and.push({ $or: statuses })
    }
  }

  let { docs, totalDocs } = await Page
    .paginate(
      searchQuery,
      {
        page: page,
        limit: itemLimit,
        sort: { updatedAt: 'desc' },
        populate: {
          path: 'mediaBlocks',
          match: mediaBlocksQuery
        }
      }
    )

  return {
    pages: docs,
    count: totalDocs
  }
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
    options.sort = { createdAt: 'desc' }
    return await getPagesWithMediaBlocks(query, options)
  }

  const pages = await Page.find().limit(options.limit).sort(options.sort)

  return {
    pages: pages,
    count: pages.length
  }
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
