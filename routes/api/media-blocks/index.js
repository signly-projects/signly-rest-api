const express = require('express');

const mediaBlocksController = require('../../../controllers/api/media-block');

const router = express.Router();

// GET /api/media-blocks
router.get('/media-blocks', mediaBlocksController.getMediaBlocks);

// POST /api/media-blocks
router.post('/media-blocks', mediaBlocksController.createMediaBlock);

module.exports = router;