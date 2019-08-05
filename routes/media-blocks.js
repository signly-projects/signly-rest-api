const express = require('express')
const { getMediaBlocks, getMediaBlock, getMediaBlockByTranscript: getMediaBlockByNormalizedText } = require('../controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks
router.get('/', getMediaBlocks)

// GET /api/media-blocks
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/pages/:pageId/media-blocks/:id
router.get('/:id', getMediaBlock)

module.exports = router
