require('dotenv').config()
const multer = require('multer')
const mkdirp = require('mkdirp')
const del = require('del')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = process.env.UPLOAD_PATH
    mkdirp.sync(dest)
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}.mp4`)
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

const clearFolder = (exceptFilename = '') => {
  del.sync([
    `${process.env.UPLOAD_PATH}/**`,
    `!${process.env.UPLOAD_PATH}`,
    `!${process.env.UPLOAD_PATH}/${exceptFilename}`
  ])
}

const deleteFile = async (filename) => {
  await del([`${process.env.UPLOAD_PATH}/${filename}`])
}

exports.storage = storage
exports.fileFilter = fileFilter
exports.clearFolder = clearFolder
exports.deleteFile = deleteFile
