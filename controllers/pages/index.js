const { validationResult } = require('express-validator/check')

const Page = require('../../models/page')

exports.getPages = (req, res, next) => {
  res.status(200).json({
    pages: [
      {
        id: '1',
        url: '/',
        requests: 1,
        mediaBlocks: ['1', '2', '3'],
        createdAt: new Date(),
        lastRequested: new Date(),
        site: {
          id: '1',
          title: 'Lloyds',
          baseUrl: 'https://www.lloydsbank.com',
          company: {
            id: '1',
            name: 'Lloyds'
          }
        }
      }
    ]
  })
}

exports.createPage = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Web page create validation failed. Request data is incorrect.',
        errors: errors.array()
      })
  }

  const page = new Page(req.body.url)

  page
    .save()
    .then(result => {
      // eslint-disable-next-line no-console
      console.log('Web page created.', result)
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })

  // Return create status AND the created web page object
  res.status(201).json({
    message: 'Page created successfully.',
    page: page
  })
}
