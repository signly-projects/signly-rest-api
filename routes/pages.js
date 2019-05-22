const express = require('express')
const { body } = require('express-validator/check')

const { getPages, getPage, createPage, updatePage, deletePage } = require('../controllers/pages')

const router = express.Router()

// GET /api/pages
router.get('/pages', getPages)

// GET /api/pages/:pageId
router.get('/pages/:pageId', getPage)

// POST /api/pages
router.post(
  '/pages',
  [
    body('url')
      .isURL()
  ],
  createPage
)

// PUT /api/sites/:pageId
router.put(
  '/pages/:pageId', 
  [
    body('url')
      .isURL()
  ],
  updatePage
)

// DELETE /api/sites/:pageId
router.delete('/pages/:pageId', deletePage)

module.exports = router
