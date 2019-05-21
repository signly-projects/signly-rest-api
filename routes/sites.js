const express = require('express')
const { body } = require('express-validator/check')

const { getSites, getSite, createSite, updateSite } = require('../controllers/sites')

const router = express.Router()

// GET /api/sites
router.get('/sites', getSites)

// GET /api/sites/:siteId
router.get('/sites/:siteId', getSite)

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

// PUT /api/sites/:siteId
router.put(
  '/sites/:siteId', 
  [
    body('title')
      .trim()
      .not().isEmpty()
      .withMessage('Web site title is empty.'),
    body('url')
      .isURL()
      .withMessage('Web site base URL doesn\'t seem to be valid.')
  ],
  updateSite
)


module.exports = router
