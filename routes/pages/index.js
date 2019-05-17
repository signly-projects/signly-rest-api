const express = require('express')
const { body, param } = require('express-validator/check')

const { getPages, getPage, createPage } = require('../../controllers/pages')

const router = express.Router()

// GET /api/pages
router.get('/pages', getPages)

// GET /api/pages/pageId
router.get(
  '/pages/:pageId',
  [
    param('pageId')
      .isMongoId()
      .withMessage('Web page id doesn\'t seem to be valid')
  ],
  getPage
)

// POST /api/pages
router.post(
  '/pages',
  [
    body('url')
      .isURL()
      .withMessage('Web page base URL doesn\'t seem to be valid.')
  ],
  createPage
)

module.exports = router
