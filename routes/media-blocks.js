const express = require('express')
const { getMediaBlocks, getMediaBlock, getMediaBlockByNormalizedText, patchMediaBlock } = require('../controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks
router.get('/', getMediaBlocks)

// GET /api/media-blocks
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/media-blocks/:id
router.get('/:id', getMediaBlock)

// PATCH
router.patch('/:id', patchMediaBlock)

module.exports = router
