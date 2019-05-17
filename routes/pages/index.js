const express = require('express')
const { body } = require('express-validator/check')

const { getPages, createPage } = require('../../controllers/pages')

const router = express.Router()

// GET /api/pages
router.get('/pages', getPages)

// POST /api/pages
router.post(
  '/pages',
  [
    body('url')
      .isURL()
      .withMessage('Web page base URL doesn\'t seem to be valid.`')
  ],
  createPage
)

module.exports = router
