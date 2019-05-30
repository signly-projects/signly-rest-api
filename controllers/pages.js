const { Page, validate } = require('../models/page')

exports.getPages = async (req, res, next) => {
  const pages = await Page.find().sort('requested')

  res.status(200).send(pages)
}

exports.getPage = async (req, res, next) => {
  const page = await Page.findById(req.params.id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send(page)
}

exports.createPage = async (req, res, next) => {
  const { error } = validate(req.body)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  const uri = req.body.uri

  let page = await Page.findOne({ uri: uri })

  if (!page) {
    page = new Page({
      uri: uri
    })

    page = await page.save()
    return res.status(201).send(page)
  }

  page.requested += 1

  page = await page.save()
  res.status(204).send(page)
}

exports.updatePage = async (req, res, next) => {
  const { error } = validate(req.body)

  if (error) {
    return res.status(422).send(error.details[0].message)
  }

  let page = await Page.findByIdAndUpdate(req.params.id, { uri: req.body.uri } )

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(200).send(page)
}

exports.deletePage = async (req, res, next) => {
  const id = req.params.id

  const page = await Page.findByIdAndDelete(id)

  if (!page) {
    return res.status(404).send('Page with the given ID not found.')
  }

  res.status(204).send(page)
}