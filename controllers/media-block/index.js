const { validationResult } = require('express-validator/check')

exports.getMediaBlocks = (req, res, next) => {
  // fetch media blocks from DB for a specific web page
  res.status(200).json({
    mediaBlocks: [
      {
        id: '1',
        videoUrl: 'http://signly.azure.com/Zlijas=124ef124521',
        text: 'products and services',
        bslScript: 'products and services'
      },
      {
        id: '2',
        videoUrl: 'http://signly.azure.com/Xxasfgaa=124ef3497',
        text: 'help and support',
        bslScript: 'help and support'
      },
      {
        id: '3',
        videoUrl: 'http://signly.azure.com/2345sgdFdgba77afhv',
        text: 'banking with us',
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
  // (try to) fetch media block with same 'text' and/or 'bslScript' from DB
  const mediaBlock = {
    id: '4',
    videoUrl: req.body.videoUrl,
    text: req.body.text,
    bslScript: req.body.bslScript
  }
  // Return create status AND the created media block object
  res.status(201).json({
    message: 'Media block created successfully.',
    site: mediaBlock
  })
}
