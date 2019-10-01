const express = require('express')
const multer = require('multer')
const validateObjectId = require('~middleware/validateObjectId')
const { getMediaBlock, getMediaBlockByNormalizedText, patchMediaBlock, uploadVideo } = require('~controllers/media-blocks')

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}_${Date.now()}.mp4`)
  }
})

const fileFilter = (req, file, cb) => {
  if (!file) {
    req.fileValidationError = { error: 'EMPTY_FILE', message: 'Empty file received' }
  } else if (file.mimetype !== 'video/mp4') {
    req.fileValidationError = { error: 'INCORRECT_FILETYPE', message: 'Incorrect file type' }
  }

  if (req.fileValidationError) {
    return cb(null, false, new Error(req.fileValidationError.message))
  }

  cb(null, true)
}

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

// POST /api/media-blocks/:id/upload-video
router.post('/:id/upload-video', validateObjectId, upload.single('file'), uploadVideo)

module.exports = router
