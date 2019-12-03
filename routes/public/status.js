const express = require('express')
const { getStatus } = require('~controllers/status')

const router = express.Router()

// GET /api/public/status
router.get('/', getStatus)

module.exports = router
