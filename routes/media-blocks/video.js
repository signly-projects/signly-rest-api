const express = require('express')
const multer = require('multer')

const { storage, fileFilter } = require('~utils/storage')
const { getVideo, uploadVideo, deleteVideo } = require('~controllers/media-blocks/video')

const router = express.Router({ mergeParams: true })

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

// GET /api/media-blocks/:id/video
router.get('/', getVideo)

router.post('/', upload.single('file'), uploadVideo)

router.delete('/', deleteVideo)

module.exports = router
