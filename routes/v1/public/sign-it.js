const express = require('express')
const { getCrossCountryMediaBlocks } = require('~controllers/sign-it')

const router = express.Router()

// GET /api/public/sign-it/cross-country
router.get('/cross-country', getCrossCountryMediaBlocks)

module.exports = router
