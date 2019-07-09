const axios = require('axios')
const cheerio = require('cheerio')
const winston = require('winston')

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

const axiosPageCrawler = async (pageUri) => {
  return await axios.get(pageUri).then(response => {
    const $ = cheerio.load(response.data, {
      xml: {
        normalizeWhitespace: true,
      }
    })

    const externalPage = new ExternalPage(pageUri, cleanText($('title').text()))

    $(config.blacklisted.selectors.join()).remove()
    $(config.selectors.join()).filter((i, el) => {
      return $(el).text().trim()
    }).each((i, el) => {
      const textSegment = cleanText($(el).text())

      if (validTextSegment($, el, $, textSegment)) {
        //console.log(`${segmentCounter} \t ${el.name} \t${el.name === 'button' ? '' : '\t'} ${textSegment}`)
        externalPage.addTextSegment(textSegment)
      }
    })

    return [externalPage]
  }).catch(() => {
    return null
  })
}

exports.pageCrawler = axiosPageCrawler
