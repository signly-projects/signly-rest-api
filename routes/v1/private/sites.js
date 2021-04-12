const express = require('express')
const validateObjectId = require('~middleware/validateObjectId')

const { getSites, getSite, deleteSite } = require('~controllers/sites')

const router = express.Router()

router.get('/', getSites)
router.get('/:id', validateObjectId, getSite)
router.delete('/:id', validateObjectId, deleteSite)

module.exports = router
