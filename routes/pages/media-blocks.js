const express = require('express')
const { getPageMediaBlocks, deletePageMediaBlock } = require('~controllers/pages/media-blocks')

const router = express.Router({ mergeParams: true })

// GET /api/pages/:pageId/media-blocks
router.get('/', getPageMediaBlocks)

// DELETE /api/pages/:pageId/media-blocks/:id
router.delete('/:id', deletePageMediaBlock)

module.exports = router
