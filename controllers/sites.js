const SiteService = require('~services/sites.service')

const concat = (x, y) => x.concat(y)
const flatMap = (f, arr) => arr.map(f).reduce(concat, [])

exports.getSites = async (req, res, next) => {
  const sites = await SiteService.findAll(req.query)
  const totalSitesCount = await SiteService.countAll(req.query)

  res.status(200).send({ sites: sites, count: totalSitesCount })
}

exports.getSite = async (req, res, next) => {
  const site = await SiteService.findById(req.params.id)

  if (!site) {
    return res.status(404).send('Site with the given ID not found.')
  }

  if (!req.query.withStats) {
    return res.status(200).send({ site: site })
  }

  const siteWithStats = await SiteService.findById(req.params.id, req.query)

  const mediaBlocks = {
    all: [],
    translated: [],
    untranslated: [],
    other: []
  }

  const words = {
    all: [],
    translated: [],
    untranslated: [],
    other: []
  }

  const sitePages = siteWithStats.pages.map(page => {
    const pageStats = {
      textSegments: {
        all: page.mediaBlocks.length,
        translated: 0,
        untranslated: 0,
        other: 0
      },
      words: {
        all: 0,
        translated: 0,
        untranslated: 0,
        other: 0
      }
    }

    mediaBlocks.all = [...mediaBlocks.all, ...page.mediaBlocks]

    page.mediaBlocks.forEach(mb => {
      const currentWords = mb.rawText.toLowerCase().split(' ')
      words.all.push(...currentWords)

      pageStats.words.all += currentWords.length
      if (mb.status === 'translated') {
        pageStats.words.translated += currentWords.length
        pageStats.textSegments.translated += 1
        mediaBlocks.translated.push(mb)
        words.translated.push(...currentWords)
      } else if (mb.status === 'untranslated') {
        pageStats.words.untranslated += currentWords.length
        pageStats.textSegments.untranslated += 1
        mediaBlocks.untranslated.push(mb)
        words.untranslated.push(...currentWords)
      } else {
        pageStats.words.other += currentWords.length
        pageStats.textSegments.other += 1
        mediaBlocks.other.push(mb)
        words.other.push(...currentWords)
      }
    })

    return Object.assign({}, {
      uri: page.uri,
      textSegments: pageStats.textSegments,
      words: pageStats.words
    })
  })

  const allUniqueMbs = [...new Set(mediaBlocks.all.map(mb => mb.normalizedText))]
  const translatedUniqueMbs = [...new Set(mediaBlocks.translated.map(mb => mb.normalizedText))]
  const untranslatedUniqueMbs = [...new Set(mediaBlocks.untranslated.map(mb => mb.normalizedText))]
  const otherUniqueMbs = [...new Set(mediaBlocks.other.map(mb => mb.normalizedText))]

  const stats = {
    textSegments: {
      all: mediaBlocks.all.length,
      translated: mediaBlocks.translated.length,
      untranslated: mediaBlocks.untranslated.length,
      other: mediaBlocks.other.length,
    },
    uniqueTextSegments: {
      all: allUniqueMbs.length,
      translated: translatedUniqueMbs.length,
      untranslated: untranslatedUniqueMbs.length,
      other: otherUniqueMbs.length,
    },
    words: {
      all: words.all.length,
      translated: words.translated.length,
      untranslated: words.untranslated.length,
      other: words.other.length,
    },
    uniqueWords: {
      all: flatMap(mb => mb.split(' '), allUniqueMbs).length,
      translated: flatMap(mb => mb.split(' '), translatedUniqueMbs).length,
      untranslated: flatMap(mb => mb.split(' '), untranslatedUniqueMbs).length,
      other: flatMap(mb => mb.split(' '), otherUniqueMbs).length,
    }
  }

  return res.status(200).send({ site: site, pages: sitePages, stats: stats })
}
