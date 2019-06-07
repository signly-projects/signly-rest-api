const express = require('express')
const validateObjectId = require('../middleware/validateObjectId')
const validateUri = require('../middleware/validateUri')
const { getPages, getPage, getPageByUri, createPage, updatePage, deletePage } = require('../controllers/pages')

const router = express.Router()

// GET /api/pages
router.get('/', getPages)

// GET /api/pages/search
router.get('/search', validateUri, getPageByUri)

// GET /api/pages/:pageId
router.get('/:id', validateObjectId, getPage)

// POST /api/pages
router.post('/', createPage)

// PUT /api/pages/:pageId
router.put('/:id', validateObjectId, updatePage)

// DELETE /api/pages/:pageId
router.delete('/:id', validateObjectId, deletePage)

module.exports = router
