const express = require('express')

const { getPages, getPage, createPage, updatePage, deletePage } = require('../controllers/pages')

const router = express.Router()

// GET /api/pages
router.get('/pages', getPages)

// GET /api/pages/:pageId
router.get('/pages/:pageId', getPage)

// POST /api/pages
router.post('/pages', createPage)

// PUT /api/sites/:pageId
router.put('/pages/:pageId', updatePage)

// DELETE /api/sites/:pageId
router.delete('/pages/:pageId', deletePage)

module.exports = router
