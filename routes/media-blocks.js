const express = require('express')
const { body } = require('express-validator/check')

const { getMediaBlocks, getMediaBlock, createMediaBlock, updateMediaBlock } = require('../controllers/media-blocks')

const router = express.Router()

// GET /api/media-blocks
router.get('/media-blocks', getMediaBlocks)

// GET /api/media-blocks/:mediaBlockId
router.get('/media-blocks/:mediaBlockId', getMediaBlock)

// POST /api/media-blocks
router.post('/media-blocks',
  [
    body('transcript')
      .trim()
      .not().isEmpty()
      .withMessage('Media block transcript is empty.')
  ],
  createMediaBlock
)

// PUT /api/media-blocks/:mediaBlockId
router.put('/media-blocks/:mediaBlockId', updateMediaBlock)


module.exports = router
