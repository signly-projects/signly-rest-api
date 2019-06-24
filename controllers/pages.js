const { Page, validatePage } = require('../models/page')
const { MediaBlock, validateMediaBlock } = require('../models/media-block')

exports.getPages = async (req, res, next) => {
  const pages = await Page.find().sort({ requested: 'desc' })

  res.status(200).send({ pages: pages })
}

exports.getPageByUri = async (req, res, next) => {
  const page = await Page.findOne({ uri: decodeURIComponent(req.query.uri) }).populate('mediaBlocks')

  if (!page) {
    return res.status(404).send('Page with the given URI not found.')
  }

  res.status(200).send({ page: page })
}

exports.getPage = async (req, res, next) => {
  const page = await Page.findById(req.params.id).populate('mediaBlocks')

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ page: page })
}

exports.createPage = async (req, res, next) => {
  const newPage = req.body.page
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

      let mediaBlock = await MediaBlock.findOne({ transcript: newMediaBlock.rawText.toLowerCase() })

      if (!mediaBlock) {
        mediaBlock = new MediaBlock({
          transcript: newMediaBlock.rawText.toLowerCase(),
          rawText: newMediaBlock.rawText
        })

        mediaBlock = await mediaBlock.save()
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

exports.updatePage = async (req, res, next) => {
  const newPage = req.body.page
  const { error } = validatePage(newPage)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let page = await Page.findById(req.params.id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  page.uri = newPage.uri || page.uri
  page.enabled = newPage.hasOwnProperty('enabled') ? newPage.enabled : page.enabled

  page = await page.save()
  res.status(200).send({ page: page })
}

exports.deletePage = async (req, res, next) => {
  const id = req.params.id

  const page = await Page.findByIdAndDelete(id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ page: page })
}
