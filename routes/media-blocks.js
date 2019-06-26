const express = require('express')
const { getMediaBlocks, getMediaBlock, getMediaBlockByTranscript } = require('../controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks
router.get('/', getMediaBlocks)

// GET /api/media-blocks
router.get('/search', getMediaBlockByTranscript)

// GET /api/pages/:pageId/media-blocks/:id
router.get('/:id', getMediaBlock)

module.exports = router
