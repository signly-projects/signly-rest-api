const HCCrawler = require('headless-chrome-crawler')
const cheerio = require('cheerio')

const ExternalPage = require('../models/external-page')

const config = {
  selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th', 'p', 'li', 'td', 'em', 'dt', 'dd', 'button'],
  blacklisted: {
    substrings: ['blog', 'community', 'help'],
    endings: ['.pdf', '.zip'],
    selectors: ['span.sr-only'],
    text: '&nbsp;'
  }
}

function isBlacklisted (uri) {
  return config.blacklisted.endings.some(ending => uri.toLowerCase().endsWith(ending))
    || config.blacklisted.substrings.some(substring => uri.toLowerCase().includes(substring))
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

function sum (items, prop){
  return items.reduce( function (a, b){
    return a + b[prop]
  }, 0)
}

module.exports = async (pageUri) => {
  let segmentCounter = 0
  let wordCounter = 0
  let visitedURLs = []
  let skippedLinks = new Set()

  function cleanTextSegment ($, el) {
    return $(el).text().trim().replace('&nbsp;', '')
  }

  const crawler = await HCCrawler.launch({
    // Function to be evaluated in browsers
    evaluatePage: () => {
      return {
        title: $('title').text(),
        body: document.querySelector('body').innerHTML
      }
    },
    // Function to be called with evaluated results from browsers
    onSuccess: async result => {
      const externalPage = new ExternalPage(result.options.url, result.result.title)

      try {
        const $ = cheerio.load(result.result.body, {
          xml: {
            normalizeWhitespace: true,
          }
        })

        $(config.selectors.join()).remove()

        $(config.selectors.join()).filter((i, el) => {
          return $(el).text().trim()
        }).each((i, el) => {
          const textSegment = cleanTextSegment($, el)

          if (validTextSegment($, el, $, textSegment)) {

            //console.log(`${segmentCounter} \t ${el.name} \t${el.name === 'button' ? '' : '\t'} ${textSegment}`)
            externalPage.addTextSegment(textSegment)
          }
        })
      } catch (err) {
        console.log(err)
      }

      // save them as wish
      if (visitedURLs.includes(result.options.url)) {
        return
      }

      // visitedURLs.push(result.options.url)
      // show some progress
      // console.log(visitedURLs.length, result.options.url, `(text segments: ${segmentCounter}`, `words: ${wordCounter})`)

      // queue new links one by one asynchronously
      // for (let link of result.links) {
      //   if (link !== `https://${websiteDomain}` && link.endsWith("/")) {
      //     link = link.slice(0, -1)
      //   }
      //
      //   if (link.startsWith(`https://${websiteDomain}`) && !hasBlacklistedString(link) && !hasBlacklistedEndings(link)) {
      //     await crawler.queue({ url: link, maxDepth: 0 });
      //   } else {
      //     skippedLinks.add(link)
      //   }
      // }
    },
    // catch all errors
    onError: error => {
      console.log(error)
    }
  })

  await crawler.queue({ url: pageUri, maxDepth: 0 })
  await crawler.onIdle()
  await crawler.close()
}
