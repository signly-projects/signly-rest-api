const express = require('express');

const pagesController = require('../../../controllers/api/pages');

const router = express.Router();

// GET /api/posts
router.get('/pages', pagesController.getPages);

// POST /api/post
router.post('/pages', pagesController.createPage);

module.exports = router;