const express = require('express')

const validateObjectId = require('~middleware/validateObjectId')

const {
  getMediaBlock,
  getMediaBlockByNormalizedText,
} = require('~controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks/search
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/media-blocks/:id
router.get('/:id', validateObjectId, getMediaBlock)

module.exports = router
