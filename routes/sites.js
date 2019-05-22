const express = require('express')
const { body } = require('express-validator/check')

const { getSites, getSite, createSite, updateSite, deleteSite } = require('../controllers/sites')

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
      .isLength({ min: 2 }),
    body('url')
      .isURL()
  ],
  createSite
)

// PUT /api/sites/:siteId
router.put(
  '/sites/:siteId',
  [
    body('title')
      .trim()
      .isLength({ min: 2 }),
    body('url')
      .isURL()
  ],
  updateSite
)

// DELETE /api/sites/:siteId
router.delete('/sites/:siteId', deleteSite)

module.exports = router
