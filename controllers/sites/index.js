const { validationResult } = require('express-validator/check')

const Site = require('../../models/site')

exports.getSites = (req, res, next) => {
  // fetch web sites from DB
  res.status(200).json({
    sites: [
      {
        id: '1',
        title: 'Lloyds',
        baseUrl: 'https://www.lloydsbank.com',
        company: {
          id: '1',
          name: 'Lloyds'
        }
      },
      {
        id: '2',
        title: 'Lloyds',
        baseUrl: 'https://www.lloydsbankacademy.co.uk',
        company: {
          id: '1',
          name: 'Lloyds'
        }
      },
      {
        id: '3',
        title: 'Barclays',
        baseUrl: 'https://www.barclays.co.uk',
        company: {
          id: '2',
          name: 'Barclays'
        }
      }
    ]
  })
}

exports.createSite = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Web site create validation failed. Request data is incorrect.',
        errors: errors.array()
      })
  }

  const site = new Site(req.body.title, req.body.url)

  site
    .save()
    .then(result => {
      // eslint-disable-next-line no-console
      console.log('Site created.', result)
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })

  // Return create status AND the created web site object
  res.status(201).json({
    message: 'Site created successfully.',
    site: site
  })
}
