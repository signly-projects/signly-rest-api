const express = require('express')
const multer = require('multer')

const { storage, fileFilter } = require('~utils/storage')
const validateObjectId = require('~middleware/validateObjectId')

const {
  getMediaBlocks,
  getMediaBlocksExport,
  getMediaBlock,
  getMediaBlockByNormalizedText,
  patchMediaBlock,
  deleteMediaBlocks
} = require('~controllers/media-blocks')

const router = express.Router()

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

// GET /api/media-blocks
router.get('/', getMediaBlocks)

// GET /api/media-blocks/search
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/media-blocks/export
router.get('/export', getMediaBlocksExport)

// GET /api/media-blocks/:id
router.get('/:id', validateObjectId, getMediaBlock)

// PATCH /api/media-blocks/:id
router.patch('/:id', validateObjectId, upload.single('file'), patchMediaBlock)

// DELETE /api/media-blocks
router.delete('/', deleteMediaBlocks)

module.exports = router
