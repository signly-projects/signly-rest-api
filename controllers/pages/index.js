const { validationResult } = require('express-validator/check')

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

  // (try to) fetch web site details using 'req.body.pageBaseUrl'
  const site = {
    id: '1',
    title: 'Lloyds Bank',
    url: req.body.pageBaseUrl,
    company: {
      id: '1',
      name: 'Lloyds'
    }
  }

  // (try to) fetch web page details using 'req.body.pageUrl'
  const page = {
    id: '1234-qwer',
    url: req.body.url,
    requests: 1,
    mediaBlocks: req.body.mediaBlocks || [],
    createdAt: new Date(),
    lastRequested: new Date(),
    site: site
  }
  // Return create status AND the created web page object
  res.status(201).json({
    message: 'Page created successfully.',
    page: page
  })
}
