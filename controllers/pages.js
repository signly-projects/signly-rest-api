const { Page, validate } = require('../models/page')

exports.getPages = async (req, res, next) => {
  const pages = await Page.find().sort({ requested: 'desc' })

  res.status(200).send({ pages: pages })
}

exports.getPageByUri = async (req, res, next) => {
  const page = await Page.findOne({ uri: decodeURIComponent(req.query.uri) })

  if (!page) {
    return res.status(404).send('Page with the given URI not found.')
  }

  res.status(200).send({ page: page })
}

exports.getPage = async (req, res, next) => {
  const page = await Page.findById(req.params.id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send({ page: page })
}

exports.createPage = async (req, res, next) => {
  const { error } = validate(req.body.page)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let page = await Page.findOne({ uri: req.body.page.uri })

  if (!page) {
    page = new Page({
      uri: req.body.page.uri
    })

    page = await page.save()
    return res.status(201).send({ page: page })
  }

  page.requested += 1

  page = await page.save()
  res.status(200).send({ page: page })
}

exports.updatePage = async (req, res, next) => {
  const { error } = validate(req.body.page)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let page = await Page.findById(req.params.id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  page.uri = req.body.page.uri || page.uri
  page.enabled = req.body.page.hasOwnProperty('enabled') ? req.body.page.enabled : page.enabled

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
