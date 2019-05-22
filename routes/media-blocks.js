const express = require('express')
const { body } = require('express-validator/check')

const { 
  getMediaBlocks, 
  getMediaBlock, 
  createMediaBlock, 
  updateMediaBlock, 
  deleteMediaBlock 
} = require('../controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks
router.get('/media-blocks', getMediaBlocks)

// GET /api/media-blocks/:mediaBlockId
router.get('/media-blocks/:mediaBlockId', getMediaBlock)

// POST /api/media-blocks
router.post(
  '/media-blocks',
  [
    body('transcript')
      .trim()
      .isLength({ min: 2 })
  ],
  createMediaBlock
)

// PUT /api/media-blocks/:mediaBlockId
router.put(
  '/media-blocks/:mediaBlockId',
  [
    body('transcript')
      .trim()
      .isLength({ min: 2 })
  ],
  updateMediaBlock
)

// DELETE /api/sites/:siteId
router.delete('/media-blocks/:mediaBlockId', deleteMediaBlock)

module.exports = router
