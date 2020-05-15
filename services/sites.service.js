const { Site } = require('~models/site')

const MAX_ITEMS = 100
const ITEMS_PER_PAGE = 20

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
    let pageCounter = 0
    let site

    for (
      let page = 1;
      pageCounter <= MAX_ITEMS && page <= MAX_ITEMS;
      page++
    ) {
      const siteQuery = await Site
        .findById(siteId)
        .populate({
          path: 'pages',
          options: {
            limit: ITEMS_PER_PAGE,
            skip: ITEMS_PER_PAGE * page - ITEMS_PER_PAGE
          },
          populate: {
            path: 'mediaBlocks',
            model: 'MediaBlock'
          }
        })

      if (!site) {
        site = siteQuery
      }

      pageCounter += siteQuery.pages.length

      site.pages.push(...siteQuery.pages)
    }

    return site
  }

  return Site.findById(siteId)
}
