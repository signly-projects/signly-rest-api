const { validationResult } = require('express-validator/check')

const MediaBlock = require('../../models/media-block')

exports.getMediaBlocks = (req, res, next) => {
  // fetch media blocks from DB for a specific web page
  res.status(200).json({
    mediaBlocks: [
      {
        id: '1',
        videoUrl: 'http://signly.azure.com/Zlijas=124ef124521',
        transcript: 'products and services',
        bslScript: 'products and services'
      },
      {
        id: '2',
        videoUrl: 'http://signly.azure.com/Xxasfgaa=124ef3497',
        transcript: 'help and support',
        bslScript: 'help and support'
      },
      {
        id: '3',
        videoUrl: 'http://signly.azure.com/2345sgdFdgba77afhv',
        transcript: 'banking with us',
        bslScript: 'banking with us'
      }
    ]
  })
}

exports.createMediaBlock = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Media block create validation failed. Request data is incorrect.',
        errors: errors.array()
      })
  }

  const mediaBlock = new MediaBlock(req.body.transcript, req.body.videoUrl, req.body.bslScript)
  mediaBlock
    .save()
    .then(result => {
      // eslint-disable-next-line no-console
      console.log('Media block created.', result)
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.log(err)
    })

  res.status(201).json({
    message: 'Media block created successfully.',
    mediaBlock: mediaBlock
  })
}
