const safe = require('safe-regex')
const mongoose = require('mongoose')

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

const getUntranslatedMediaBlocksByIds = async (mediaBlocksIds) => {
  return await MediaBlock.find({ status: 'untranslated', _id: { $in: mediaBlocksIds } })
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

function addPageIndexToMediaBlocks (mediaBlocks, mediaBlocksIndexes) {
  return mediaBlocks.map(mb => {
    for (let i = 0; i < mediaBlocksIndexes.length; i++) {
      if (mediaBlocksIndexes[i].mediaBlockId === mb._id.toString()) {
        mb._doc.pageIndex = mediaBlocksIndexes[i].index
        break
      }
    }

    return mb
  })
}

const processQuery = async (pagesLimit, pagesSort, mediaBlocksQuery) => {
  let pages = await Page
    .find({ enabled: true })
    .sort(pagesSort)

  const resultPages = []

  for (let i = 0; i < pagesLimit && resultPages.length < pagesLimit; i++) {
    const page = pages[i]

    if (!page) {
      break
    }

    let mediaBlocks = await getMediaBlocksForPage(mediaBlocksQuery, page.mediaBlocks)

    if (mediaBlocks.length > 0) {
      mediaBlocks = addPageIndexToMediaBlocks(mediaBlocks, page.mediaBlocksIndexes)

      // Sorts mediaBlocks by page index in asc order
      mediaBlocks.sort(nestedSort('_doc', 'pageIndex', 'asc'))
      page.mediaBlocks = mediaBlocks
      page.mediaBlocksIndexes = undefined
      resultPages.push(page)
    }
  }

  return resultPages
}

const getPagesWithMediaBlocks = async (queryParams, options) => {
  if (!safe) {
    return []
  }

  const mediaBlocksQuery = {
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
      mediaBlocksQuery.$and.push({ status: queryParams.mediaBlocksStatus })
    } else if (Array.isArray(queryParams.mediaBlocksStatus)) {
      const statuses = queryParams.mediaBlocksStatus.map(status => { return { status: status } })
      mediaBlocksQuery.$and.push({ $or: statuses })
    }
  }

  return processQuery(queryParams.limit, options.sort, mediaBlocksQuery)
}

exports.countAll = async (query = {}) => {
  return Page.countDocuments(query)
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

exports.findById = async (pageId, withMediaBlocks = false, mediaBlockStatus = null) => {
  if (withMediaBlocks) {
    if (mediaBlockStatus) {
      return Page.findById(pageId)
        .populate({
          path: 'mediaBlocks',
          match: {
            status: mediaBlockStatus
          }
        })
    }

    return Page.findById(pageId).populate('mediaBlocks')
  }

  return Page.findById(pageId)
}

exports.findOneByMediaBlockId = async (mediaBlockId) => {
  return Page.findOne({ mediaBlocks: mongoose.Types.ObjectId(mediaBlockId) }).populate('mediaBlocks')
}

exports.create = async (newPage, mediaBlocks) => {
  const mediaBlockIds = mediaBlocks.map(mb => mb._id)

  let page = new Page({
    requested: newPage.requested,
    enabled: true,
    // enabled: newPage.hasOwnProperty('enabled') ? newPage.enabled : false,
    title: newPage.title,
    uri: newPage.uri,
    mediaBlocks: mediaBlockIds,
    translated: !mediaBlocks.some(mb => mb.status === 'untranslated')
  })

  return await page.save()
}

exports.incrementVisits = async (page) => {
  page.visitCounter += 1

  return await page.save()
}

exports.update = async (page, newPage, mediaBlocks) => {
  const mediaBlockIds = mediaBlocks.map(mb => mb._id)

  page.title = newPage.title || page.title
  page.uri = newPage.uri || page.uri
  page.enabled = newPage.hasOwnProperty('enabled') ? newPage.enabled : page.enabled
  page.mediaBlocks.push(...mediaBlockIds)

  const existingPage = await Page.findOne({ uri: page.uri }).populate(['mediaBlocks'])
  page.translated = newPage.translated || !existingPage.mediaBlocks.some(mb => mb.status === 'untranslated')

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

const newProcessQuery = async (pageQuery) => {
  const result = await Page
    .paginate(
      {
        $or: [
          {
            enabled: true
          },
          {
            signit: true
          }
        ],
        translated: false,
        uri: {
          $regex: `^${pageQuery.websiteUrl || ''}`,
          $options: 'i'
        }
      },
      {
        page: pageQuery.page,
        limit: pageQuery.limit,
        sort: { createdAt: 'desc' },
      }
    )

  return { pages: result.docs, totalPages: result.totalDocs }
}

exports.findAllWithUntranslatedMediablocks = async (queryParams) => {
  const pageQuery = {
    limit: parseInt(queryParams.limit, 10),
    page: parseInt(queryParams.page, 10),
    websiteUrl: queryParams.website
  }

  return newProcessQuery(pageQuery)
}

exports.countAllUntranslatedMediablocks = async () => {
  const pagesPerQuery = 10
  const pageCount = await Page.countDocuments({ enabled: true })

  const fetchingRounds = ((pageCount / pagesPerQuery) + 1).toFixed()
  let totalPages = 0
  let untranslatedWordsCounter = 0
  const untranslatedMediaBlocks = new Set()

  for (let i = 1; i <= fetchingRounds; i++) {
    const result = await Page
      .paginate(
        {
          $or: [
            {
              enabled: true
            },
            {
              signit: true
            }
          ]
        },
        {
          page: i,
          limit: pagesPerQuery
        }
      )

    const pages = result.docs

    for (let j = 0; j < pages.length; j++) {
      const pageMediaBlocks = pages[j].mediaBlocks
      if (pageMediaBlocks.length > 0) {
        const mediaBlocks = await getUntranslatedMediaBlocksByIds(pageMediaBlocks)

        if (mediaBlocks.length) {
          mediaBlocks.forEach(mb => {
            untranslatedMediaBlocks.add(mb._doc._id.toString())
            untranslatedWordsCounter += mb.rawText.split(' ').length
          })
        }
      }
    }

    totalPages = result.totalDocs
  }

  return { pageCount: totalPages, untranslatedMediaBlockCount: untranslatedMediaBlocks.size, untranslatedWordCount: untranslatedWordsCounter }
}

exports.addMediaBlockToPage = async (page, mediaBlock) => {
  page.mediaBlocks.push(mediaBlock)

  return await page.save()
}

exports.updateTranslatedPages = async (mediaBlockId) => {
  let pages = await Page.find({ mediaBlocks: mongoose.Types.ObjectId(mediaBlockId) })

  for (const page of pages) {
    page.translated = false
    await page.save()
  }
}

exports.deletePagesByIds = async (pageIds) => {
  return await Page.deleteMany({
    _id: {
      $in: pageIds
    }
  })
}
