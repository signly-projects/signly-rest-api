const express = require('express')
const { getExternalPage } = require('../controllers/external')

const router = express.Router()

// GET /api/external/page?uri=https://signly.co/
router.get('/page', getExternalPage)

// GET /api/external/site?uri=https://signly.co/
// router.get('/site', getExternalSite)

module.exports = router
