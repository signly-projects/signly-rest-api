const winston = require('winston')
const { Page, validatePage } = require('../models/page')
const { MediaBlock, validateMediaBlock } = require('../models/media-block')
const { puppeteerCrawler } = require('../services/pupeteer-crawler')
const axios = require('axios')

exports.getExternalPage = async (req, res, next) => {
  const pageUri = decodeURIComponent(req.query.uri)

  if (!pageUri) {
    return res.status(422).send('External page URI not specified.')
  }

  try {
    await axios.get(pageUri, { timeout: 10000 })
  } catch (error) {
    winston.error(error)
    return res.status(404).send('External page with the given URI not found.', error)
  }

  let externalPage = await puppeteerCrawler(pageUri)

  res.status(200).send({ externalPage: externalPage })
}

exports.createFromExternalPage = async (req, res, next) => {
  const pageUri = decodeURIComponent(req.body.page.uri)

  if (!pageUri) {
    return res.status(422).send('External page URI not specified.')
  }

  try {
    await axios.get(pageUri, { timeout: 10000 })
  } catch (error) {
    return res.status(404).send(error)
    // return res.status(404).send('External page with the given URI not found.')
  }

  let newPage = await puppeteerCrawler(pageUri)

  const { error } = validatePage(newPage)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let page = await Page.findOne({ uri: newPage.uri })

  let mediaBlocks = []

  if (newPage.mediaBlocks) {
    await Promise.all(newPage.mediaBlocks.map(async (newMediaBlock) => {

      const { error } = validateMediaBlock(newMediaBlock)
      if (error) {
        return res.status(422).send(error.details[0].message)

      }

      let mediaBlock = await MediaBlock.findOne({ normalizedText: newMediaBlock.rawText.toLowerCase() })
      if (!mediaBlock) {
        mediaBlock = new MediaBlock({
          normalizedText: newMediaBlock.rawText.toLowerCase(),
          rawText: newMediaBlock.rawText
        })
        mediaBlock = await mediaBlock.save()
      }

      if (page && page.mediaBlocks && page.mediaBlocks.length) {
        if (!page.mediaBlocks.some(existingMediaBlock => existingMediaBlock._id.equals(mediaBlock._id))) {
          mediaBlocks.push(mediaBlock._id)
        }
      } else {
        mediaBlocks.push(mediaBlock._id)
      }
    }))
  }

  if (!page) {
    page = new Page({
      uri: newPage.uri,
      mediaBlocks: mediaBlocks
    })

    page = await page.save()
    return res.status(201).send({ page: page })
  }

  page.requested += 1
  page.mediaBlocks.push(...mediaBlocks)

  page = await page.save()
  res.status(200).send({ page: page })
}
