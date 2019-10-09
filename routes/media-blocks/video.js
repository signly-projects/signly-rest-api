const express = require('express')
const multer = require('multer')

const { storage, fileFilter } = require('~utils/storage')
const { uploadVideo, deleteVideo } = require('~controllers/media-blocks/video')

const router = express.Router({ mergeParams: true })

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

// GET /api/media-blocks/:id/videos
router.post('/', upload.single('file'), uploadVideo)

router.delete('/', deleteVideo)

module.exports = router
