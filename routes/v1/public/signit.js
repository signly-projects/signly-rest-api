const express = require('express')
const {
  getCrossCountryMediaBlocks,
  createCrossCountryMediaBlock
} = require('~controllers/signit')

const router = express.Router()

// GET /api/public/signit/crosscountry
router.get('/crosscountry', getCrossCountryMediaBlocks)

/* POST /api/public/signit/crosscountry */
router.post('/crosscountry', createCrossCountryMediaBlock)

module.exports = router
