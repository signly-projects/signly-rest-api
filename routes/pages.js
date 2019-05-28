const express = require('express')

const { getPages, getPage, createPage, updatePage, deletePage } = require('../controllers/pages')

const router = express.Router()

// GET /api/pages
router.get('/', getPages)

// GET /api/pages/:pageId
router.get('/:pageId', getPage)

// POST /api/pages
router.post('/', createPage)

// PUT /api/sites/:pageId
router.put('/:pageId', updatePage)

// DELETE /api/sites/:pageId
router.delete('/:pageId', deletePage)

module.exports = router
