const express = require('express')
const { getPageMediaBlocks } = require('~controllers/pages/media-blocks')

const router = express.Router({ mergeParams: true })

// GET /api/pages/:id/media-blocks
router.get('/', getPageMediaBlocks)

module.exports = router
