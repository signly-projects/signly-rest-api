const express = require('express')

const validateObjectId = require('~middleware/validateObjectId')
const video = require('~routes/media-blocks/video')

const { getMediaBlock, getMediaBlockByNormalizedText, patchMediaBlock } = require('~controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/media-blocks/:id
router.get('/:id', validateObjectId, getMediaBlock)

// PATCH
router.patch('/:id', validateObjectId, patchMediaBlock)


router.use('/:id/video', validateObjectId, video)

module.exports = router
