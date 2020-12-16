const { Site } = require('~models/site')
const { Page } = require('~models/page')

const MAX_ITEMS = 100
const MAX_PAGES_PER_QUERY = 20

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
            }
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
