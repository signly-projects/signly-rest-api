const express = require('express')
const multer = require('multer')

const { storage, fileFilter } = require('~utils/storage')
const validateObjectId = require('~middleware/validateObjectId')

const { getMediaBlocks, getMediaBlock, getMediaBlockByNormalizedText, patchMediaBlock } = require('~controllers/media-blocks')

const router = express.Router()

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

// GET /api/media-blocks
router.get('/', getMediaBlocks)

// GET /api/media-blocks/search
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/media-blocks/:id
router.get('/:id', validateObjectId, getMediaBlock)

// PATCH /api/media-blocks/:id
router.patch('/:id', validateObjectId, upload.single('file'), patchMediaBlock)

module.exports = router
