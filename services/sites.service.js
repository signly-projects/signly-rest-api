const { Site } = require('~models/site')
const { Page } = require('~models/page')

const MAX_ITEMS = 100
const MAX_PAGES_PER_QUERY = 10

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

exports.find = async () => {
  return await Site.find().sort({ title: 'asc' })
}

exports.findByPageUrl = async (pageUrl) => {
  let siteObject = new URL(pageUrl)

  return await Site.findOne({ url: siteObject.origin })
}

exports.findOrCreate = async (pageUrl) => {
  let urlObject = new URL(pageUrl)

  let site = await Site.findOne({ url: urlObject.origin })

  if (!site) {
    site = new Site({
      title: urlObject.hostname,
      url: urlObject.origin
    })
  }

  return await site.save()
}

exports.addPageToSite = async (site, pageId) => {
  if (!site.pages.some(pId => pId.equals(pageId))) {
    site.pages.push(pageId)
  }

  return await site.save()
}

exports.findById = async (siteId, query) => {
  if (query && query.withStats) {
    const site = await Site
      .findById(siteId)

    const sitePagesCount = await Page
      .countDocuments({
        uri: {
          $regex: site.url,
          $options: 'i'
        }
      })

    const fetchingRounds = ((sitePagesCount / MAX_PAGES_PER_QUERY) + 1).toFixed()
    const pages = []

    for (let i = 1; i <= fetchingRounds; i++) {
      const { docs } = await Page
        .paginate(
          {
            uri: {
              $regex: site.url,
              $options: 'i'
            },
            enabled: true
          },
          {
            page: i,
            limit: MAX_PAGES_PER_QUERY,
            sort: { createdAt: 'asc' },
            populate: {
              path: 'mediaBlocks'
            }
          }
        )

      pages.push(...docs)
    }

    site.pages = pages

    return site
  }

  return Site.findById(siteId)
}

exports.findByIdAndUpdate = async (siteId, query) => {
  return await Site.findByIdAndUpdate(siteId, query)
}

exports.delete = async (siteId) => {
  const site = await Site.findById(siteId)
  await Page.deleteMany({ id: { $in: site.pages } })

  return site.delete()
}
