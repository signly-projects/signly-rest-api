const express = require('express')
const multer = require('multer')
const validateObjectId = require('~middleware/validateObjectId')
const { storage, fileFilter } = require('~utils/storage')
const { getMediaBlock, getMediaBlockByNormalizedText, patchMediaBlock, uploadVideo, deleteVideo } = require('~controllers/media-blocks')

const router = express.Router()

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

// GET /api/media-blocks
router.get('/search', getMediaBlockByNormalizedText)

// GET /api/media-blocks/:id
router.get('/:id', validateObjectId, getMediaBlock)

// PATCH
router.patch('/:id', validateObjectId, patchMediaBlock)


// POST /api/media-blocks/:id/video
router.post('/:id/video', validateObjectId, upload.single('file'), uploadVideo)

router.delete('/:id/video', validateObjectId, deleteVideo)

module.exports = router
