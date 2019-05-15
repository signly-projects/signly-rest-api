const express = require('express')
const { body } = require('express-validator/check')

const { getMediaBlocks, createMediaBlock } = require('../../controllers/media-block')

const router = express.Router()

// GET /api/media-blocks
router.get('/media-blocks', getMediaBlocks)

// POST /api/media-blocks
router.post('/media-blocks',
  [
    body('text')
      .trim()
      .not().isEmpty()
      .withMessage('Media block text is empty.')
  ],
  createMediaBlock)

module.exports = router
