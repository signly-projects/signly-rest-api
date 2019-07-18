const winston = require('winston')
const HCCrawler = require('headless-chrome-crawler')
const cheerio = require('cheerio')

let ExternalPage = require('../models/external-page')

const config = {
  selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th', 'p', 'li', 'td', 'em', 'dt', 'dd', 'button'],
  blacklisted: {
    substrings: ['blog', 'community', 'help'],
    endings: ['.pdf', '.zip'],
    selectors: ['span.sr-only'],
    text: '&nbsp;'
  }
}

function isLastTextElement ($, el) {
  const innerElements = $(el).find(config.selectors.join())

  if (innerElements.length === 0) {
    return true
  } else {
    let innerElementWithSameText = false

    innerElements.each(innerEl => {
      if ($(el).text().trim() === $(innerEl).text().trim()) {
        innerElementWithSameText = isLastTextElement($, innerEl)
      }
    })

    return innerElementWithSameText
  }
}

function validTextSegment ($, el, textSegment) {
  return textSegment && isLastTextElement($, el)
}

function cleanText (text) {
  return text
    .replace('&nbsp;', '')
    .trim()
}

function isBlacklisted (uri) {
  return config.blacklisted.endings.some(ending => uri.toLowerCase().endsWith(ending))
    || config.blacklisted.substrings.some(substring => uri.toLowerCase().includes(substring))
}

function sum (items, prop){
  return items.reduce( function (a, b){
    return a + b[prop]
  }, 0)
}

const headlessWebCrawler = async (pageUri, includeNestedPages = false) => {
  let segmentCounter = 0
  let wordCounter = 0
  let visitedURLs = []
  let externalPages = []
  let skippedLinks = new Set()

  const crawler = await HCCrawler.launch({
    evaluatePage: () => {
      return {
        title: document.querySelector('title').innerText,
        body: document.querySelector('body').innerHTML
      }
    },
    onSuccess: async result => {
      const externalPage = new ExternalPage(result.options.url, cleanText(result.result.title))

      try {
        const $ = cheerio.load(result.result.body, {
          xml: {
            normalizeWhitespace: true,
          }
        })

        $(config.blacklisted.selectors.join()).remove()
        $(config.selectors.join()).filter((i, el) => {
          return $(el).text().trim()
        }).each((i, el) => {
          const textSegment = cleanText($(el).text())

          if (validTextSegment($, el, textSegment)) {
            //console.log(`${segmentCounter} \t ${el.name} \t${el.name === 'button' ? '' : '\t'} ${textSegment}`)
            externalPage.addTextSegment(textSegment)
          }
        })
        externalPages.push(externalPage)
      } catch (err) {
        // winston.log(err)
      }

      if (includeNestedPages) {
        if (visitedURLs.includes(result.options.url)) {
          return
        }

        visitedURLs.push(result.options.url)

        winston.log(visitedURLs.length.toString(), result.options.url, `(text segments: ${segmentCounter}`, `words: ${wordCounter})`)

        for (let link of result.links) {
          if (link !== pageUri && link.endsWith('/')) {
            link = link.slice(0, -1)
          }

          if (link.startsWith(pageUri) && !isBlacklisted(link)) {
            await crawler.queue({ url: link, maxDepth: 0 })
          } else {
            skippedLinks.add(link)
          }
        }
      }
    },
    // catch all errors
    onError: (error) => {
      winston.error(error)
    }
  })

  try {
    await crawler.queue({ url: pageUri, maxDepth: 0 })
    await crawler.onIdle()
    await crawler.close()
  } catch (error) {
    winston.error(error)
    return null
  }

  return externalPages[0]
}

exports.headlessWebCrawler = headlessWebCrawler
