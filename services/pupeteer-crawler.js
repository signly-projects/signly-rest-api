const puppeteer = require('puppeteer')
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

const isLastTextElement = ($, el) => {
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

const validTextSegment = ($, el, textSegment) => {
  return textSegment && isLastTextElement($, el)
}

const cleanText = (text) => {
  return text
    .replace(config.blacklisted.text, '')
    .trim()
}

const getData = (uri, html) => {
  const externalPage = new ExternalPage(uri, cleanText(html.title))

  const $ = cheerio.load(html.body, { xml: { normalizeWhitespace: true } })

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

  return externalPage
}

const puppeteerCrawler = async (uri) => {
  return puppeteer.launch({ headless: true })
    .then(async browser => {
      const page = await browser.newPage()
      await page.goto(uri)
      await page.waitForSelector('body')

      const html = await page.evaluate(() => {
        return {
          title: document.querySelector('title').innerText,
          body: document.querySelector('body').innerHTML
        }
      })

      await browser.close()

      return getData(uri, html)
    })
    .catch((error) => {
      winston.error(error)
      return null
    })
}

exports.puppeteerCrawler = puppeteerCrawler
