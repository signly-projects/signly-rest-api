const { Page } = require('~models/page')

exports.findAll = async (query) => {
  let options = {
    sort: {
      requested: 'desc'
    }
  }

  if (query.withMediaBlocks) {
    let pages = await Page.find().sort(options.sort).populate({
      path: 'mediaBlocks',
      options: {
        sort: { updatedAt: 'asc' }
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

  return await Page.find().sort(options.sort)
}

exports.findByUri = async (uri, withMediaBlocks = false) => {
  if (withMediaBlocks) {
    return Page.findOne({ uri: uri }).populate('mediaBlocks')
  } else {
    return Page.findOne({ uri: uri })
  }
}

exports.findById = async (pageId, withMediaBlocks = false) => {
  if (withMediaBlocks) {
    return Page.findById(pageId).populate('mediaBlocks')
  } else {
    return Page.findById(pageId)
  }
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
