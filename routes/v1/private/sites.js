const express = require('express')
const validateObjectId = require('~middleware/validateObjectId')

const { getSites, getSite, patchSite, deleteSite } = require('~controllers/sites')

const router = express.Router()

router.get('/', getSites)
router.get('/:id', validateObjectId, getSite)
router.patch('/:id', validateObjectId, patchSite)
router.delete('/:id', validateObjectId, deleteSite)

module.exports = router
