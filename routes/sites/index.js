const express = require('express')
const { body } = require('express-validator/check')

const { getSites, createSite } = require('../../controllers/sites')

const router = express.Router()

// GET /api/sites
router.get('/sites', getSites)

// POST /api/sites
router.post(
  '/sites',
  [
    body('title')
      .trim()
      .not().isEmpty()
      .withMessage('Web site title is empty.'),
    body('url')
      .isURL()
      .withMessage('Web site base URL doesn\'t seem to be valid.')
  ],
  createSite
)

module.exports = router
