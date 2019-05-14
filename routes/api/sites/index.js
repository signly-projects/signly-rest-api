const express = require('express');

const sitesController = require('../../../controllers/api/sites');

const router = express.Router();

// GET /api/sites
router.get('/sites', sitesController.getSites);

// POST /api/sites
router.post('/sites', sitesController.createSite);

module.exports = router;