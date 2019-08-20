const express = require('express')
const validateUri = require('~middleware/validateUri')

const { getExternalPage, createFromExternalPage } = require('~controllers/external')

const router = express.Router()

// GET /api/external/page?uri=https://signly.co/
router.get('/page', validateUri, getExternalPage)

// POST /api/external/page
router.post('/page', createFromExternalPage)

// GET /api/external/site?uri=https://signly.co/
// router.get('/site', getExternalSite)

module.exports = router
