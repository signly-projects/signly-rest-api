const express = require('express')
const validateObjectId = require('~middleware/validateObjectId')

const { getSites, getSite } = require('~controllers/sites')

const router = express.Router()

router.get('/', getSites)
router.get('/:id', validateObjectId, getSite)


module.exports = router
