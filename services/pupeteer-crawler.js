const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const winston = require('winston')

let ExternalPage = require('../models/external-page')

const config = {
  selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th', 'p', 'td', 'em', 'dt', 'dd', 'a'],
  blacklisted: {
    substrings: ['blog', 'community', 'help'],
    endings: ['.pdf', '.zip'],
    selectors: ['span.sr-only'],
    text: '&nbsp;'
  }
}

const isLastTextElement = ($, element) => {
  const elementText = $(element).text().trim()
  const innerElements = $(element).find(config.selectors.join())

  if (innerElements.length === 0) {
    return true
  } else {
    let innerElementWithSameText = false
    let innerTextContent = ''

    innerElements.each(innerElement => {
      innerTextContent += innerElement.innerText
      const innerElementText = $(innerElement).text().trim()
      if (elementText === innerElementText) {
        innerElementWithSameText = true
      }
    })

    const remainingText = elementText.replace(innerTextContent, '')

    if (remainingText) {
      innerElementWithSameText = true
    }

    return innerElementWithSameText
  }
}

const validTextSegment = ($, element) => {
  return isLastTextElement($, element)
}

const cleanText = (text) => {
  return text
    .replace(/\u00a0/g, '')
    .replace(/(\r\n|\n|\r|\\n)/gm, ' ')
    .replace(/\s\s+/g, ' ')
    .replace(' .', '.')
    .trim()
}

const getData = (uri, html) => {
  const externalPage = new ExternalPage(uri, cleanText(html.title))

  const $ = cheerio.load(html.body)

  $(config.blacklisted.selectors.join()).remove()
  $(config.selectors.join())
    .filter((i, element) => {
      return $(element).text().trim()
    })
    .each((i, element) => {
      if (validTextSegment($, element)) {
        const textSegment = cleanText($(element).text())
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
