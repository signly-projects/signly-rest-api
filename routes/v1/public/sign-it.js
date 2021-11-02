const express = require('express')
const {
  getCrossCountryMediaBlocks,
  createCrossCountryMediaBlock
} = require('~controllers/sign-it')

const router = express.Router()

// GET /api/public/sign-it/cross-country
router.get('/cross-country', getCrossCountryMediaBlocks)

/* POST /api/public/sign-it/cross-country */
router.post('/cross-country', createCrossCountryMediaBlock)

module.exports = router
