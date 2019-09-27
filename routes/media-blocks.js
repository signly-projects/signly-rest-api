const express = require('express')
const validateObjectId = require('~middleware/validateObjectId')
const { getMediaBlock, getMediaBlockByNormalizedText, patchMediaBlock } = require('~controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/media-blocks/:id
router.get('/:id', validateObjectId, getMediaBlock)

// PATCH
router.patch('/:id', validateObjectId, patchMediaBlock)

module.exports = router
