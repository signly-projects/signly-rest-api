const SiteService = require('~services/sites.service')

const concat = (x, y) => x.concat(y)
const flatMap = (f, arr) => arr.map(f).reduce(concat, [])

exports.getSites = async (req, res, next) => {
  const sites = await SiteService.findAll(req.query)
  const totalSitesCount = await SiteService.countAll(req.query)

  res.status(200).send({ sites: sites, count: totalSitesCount })
}

exports.getSite = async (req, res, next) => {
  const site = await SiteService.findById(req.params.id, req.query)

  if (!site) {
    return res.status(404).send('Site with the given ID not found.')
  }

  if (req.query.withStats) {
    const mediaBlocks = {
      all: [],
      translated: [],
      untranslated: [],
      other: []
    }

    site.pages.forEach(page => {
      mediaBlocks.all = [...mediaBlocks.all, ...page.mediaBlocks]

      page.mediaBlocks.forEach(mb => {
        if (mb.status === 'translated') {
          mediaBlocks.translated.push(mb)
        } else if (mb.status === 'untranslated') {
          mediaBlocks.untranslated.push(mb)
        } else {
          mediaBlocks.other.push(mb)
        }
      })
    })

    const allWords = flatMap(mb => mb.rawText.split(' '), mediaBlocks.all)
    const translatedWords = flatMap(mb => mb.rawText.split(' '), mediaBlocks.translated)
    const untranslatedWords = flatMap(mb => mb.rawText.split(' '), mediaBlocks.untranslated)
    const otherWords = flatMap(mb => mb.rawText.split(' '), mediaBlocks.other)

    const stats = {
      textSegments: {
        all: mediaBlocks.all.length,
        translated: mediaBlocks.translated.length,
        untranslated: mediaBlocks.untranslated.length,
        other: mediaBlocks.other.length,
      },
      uniqueTextSegments: {
        all: [...new Set(mediaBlocks.all)].length,
        translated: [...new Set(mediaBlocks.translated)].length,
        untranslated: [...new Set(mediaBlocks.untranslated)].length,
        other: [...new Set(mediaBlocks.other)].length,
      },
      words: {
        all: allWords.length,
        translated: translatedWords.length,
        untranslated: untranslatedWords.length,
        other: otherWords.length,
      },
      uniqueWords: {
        all: [...new Set(allWords)].length,
        translated: [...new Set(translatedWords)].length,
        untranslated: [...new Set(untranslatedWords)].length,
        other: [...new Set(otherWords)].length
      }
    }

    return res.status(200).send({ site: site, stats: stats })
  }

  res.status(200).send({ site: site })
}
