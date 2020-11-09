const safe = require('safe-regex')

const { Page } = require('~models/page')
const { MediaBlock } = require('~models/media-block')
const { MediaBlockIndex } = require('~models/media-block-index')

const MAX_ITEMS = 200

const getMediaBlocksForPage = async (query, mediaBlocksIds) => {
  return await MediaBlock
    .find(query)
    .where('_id')
    .in(mediaBlocksIds)
    .exec()
}

const nestedSort = (prop1, prop2 = null, direction = 'asc') => (e1, e2) => {
  let a, b, sortOrder

  if (!e1[prop1]) {
    return 0
  }

  a = prop2 ? e1[prop1][prop2] : e1[prop1]
  b = prop2 ? e2[prop1][prop2] : e2[prop1]
  sortOrder = direction === 'asc' ? 1 : -1

  return (a < b) ? -sortOrder : (a > b) ? sortOrder : 0
}

const processQuery = async (queryParams, sort, query) => {
  const pageQuery = queryParams.enabled ? { enabled: true } : {}

  let pages = await Page
    .find(pageQuery)
    .sort(sort)

  const resultPages = []

  for (let i = 0; i < queryParams.limit && resultPages.length < queryParams.limit; i++) {
    const page = pages[i]

    if (!page) {
      break
    }

    let mediaBlocks = await getMediaBlocksForPage(query, page.mediaBlocks)

    if (mediaBlocks.length > 0) {
      mediaBlocks = mediaBlocks.map(mb => {
        for (let i = 0; i < page.mediaBlocksIndexes.length; i++) {
          if (page.mediaBlocksIndexes[i].mediaBlockId === mb._id.toString()) {
            mb._doc.pageIndex = page.mediaBlocksIndexes[i].index
            break
          }
        }

        return mb
      })

      // Sorts mediaBlocs by page index in asc order
      mediaBlocks.sort(nestedSort('_doc', 'pageIndex', 'asc'))
      page.mediaBlocks = mediaBlocks
      resultPages.push(page)
    }
  }

  return resultPages
}

const getPagesWithMediaBlocks = async (queryParams, options) => {
  if (!safe) {
    return []
  }

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
    if (typeof queryParams.mediaBlocksStatus === 'string' || queryParams.mediaBlocksStatus instanceof String) {
      query.$and.push({ status: queryParams.mediaBlocksStatus })
    } else if (Array.isArray(queryParams.mediaBlocksStatus)) {
      const statuses = queryParams.mediaBlocksStatus.map(status => { return { status: status } })
      query.$and.push({ $or: statuses })
    }
  }

  return processQuery(queryParams, options.sort, query)
}

exports.countAll = async () => {
  return Page.countDocuments()
}

exports.findAll = async (queryParams) => {
  let options = {
    sort: {
      requested: 'desc'
    },
    limit: queryParams.limit ? parseInt(queryParams.limit, 10) : MAX_ITEMS
  }

  if (queryParams.withMediaBlocks) {
    options.sort = { createdAt: 'desc' }
    return await getPagesWithMediaBlocks(queryParams, options)
  }

  const pageQuery = queryParams.enabled ? { enabled: true } : {}

  return await Page.find(pageQuery).limit(options.limit).sort(options.sort)
}

exports.findByUri = async (uri, withMediaBlocks = false) => {
  if (withMediaBlocks) {
    return Page.findOne({ uri: uri }).populate(['mediaBlocks'])
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
    enabled: true,
    // enabled: newPage.hasOwnProperty('enabled') ? newPage.enabled : false,
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

exports.findOrCreateMediaBlockIndex = async (pageId, mediaBlockId, newIndex) => {
  let mediaBlockIndex = await MediaBlockIndex.findOne({ page: pageId, mediaBlock: mediaBlockId })

  if (!mediaBlockIndex) {
    mediaBlockIndex = await MediaBlockIndex.create({
      page: pageId,
      mediaBlock: mediaBlockId,
      index: newIndex
    })
  } else {
    mediaBlockIndex.index = newIndex
  }

  return await mediaBlockIndex.save()
}

exports.indexMediaBlocks = async (page, newPage) => {
  const savedPage = await this.findById(page._id, true)
  page.mediaBlocksIndexes = []

  for (let newMediaBlock of newPage.mediaBlocks) {
    const savedMediaBlock = savedPage.mediaBlocks.find(mb => mb.normalizedText === newMediaBlock.rawText.toLowerCase())
    page.mediaBlocksIndexes.push({ index: newMediaBlock.index, mediaBlockId: savedMediaBlock._id.toString() })
  }

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
