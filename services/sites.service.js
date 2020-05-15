const { Site } = require('~models/site')
const { Page } = require('~models/page')

const MAX_ITEMS = 100

exports.countAll = async () => {
  return Site.countDocuments()
}

exports.findAll = async (query) => {
  let options = {
    sort: {
      title: 'asc'
    },
    limit: query.limit ? parseInt(query.limit, 10) : MAX_ITEMS
  }

  return await Site.find().limit(options.limit).sort(options.sort)
}

exports.findOrCreate = async (pageUrl, pageId) => {
  let urlObject = new URL(pageUrl)

  let site = await Site.findOne({ url: urlObject.origin })

  if (!site) {
    site = new Site({
      title: urlObject.hostname,
      url: urlObject.origin
    })
  }

  if (!site.pages.some(page => page._id.equals(pageId))) {
    site.pages.push(pageId)
  }

  return await site.save()
}

exports.findById = async (siteId, query) => {
  if (query && query.withStats) {
    const site = await Site
      .findById(siteId)
      .populate({
        path: 'pages'
      })

    site.pages = await Page
      .find()
      .where('_id')
      .in(site.pages)
      .populate({
        path: 'mediaBlocks'
      })

    return site
  }

  return Site.findById(siteId)
}
