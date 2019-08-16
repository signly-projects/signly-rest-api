const express = require('express')
const validateObjectId = require('../middleware/validateObjectId')
const validateUri = require('../middleware/validateUri')
const { getPages, getPage, getPageByUri, createPage, patchPage, deletePage } = require('../controllers/pages')

const router = express.Router()

// GET /api/pages
router.get('/', getPages)

// GET /api/pages/search
router.get('/search', validateUri, getPageByUri)

// GET /api/pages/:pageId
router.get('/:id', validateObjectId, getPage)

// POST /api/pages
router.post('/', createPage)

// PATCH /api/pages/:pageId
router.patch('/:id', validateObjectId, patchPage)

// DELETE /api/pages/:pageId
router.delete('/:id', validateObjectId, deletePage)

module.exports = router
