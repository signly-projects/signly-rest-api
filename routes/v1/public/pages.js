const express = require('express')
const validateUri = require('~middleware/validateUri')
const { getPageByUri, createPage } = require('~controllers/pages')

const router = express.Router()

/* GET /api/public/pages/search */
router.get('/search', validateUri, getPageByUri)

/* POST /api/public/pages */
router.post('/', createPage)

module.exports = router
