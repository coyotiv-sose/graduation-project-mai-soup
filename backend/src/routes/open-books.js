const express = require('express')

const mustLogin = require('../middleware/must-login')
const { getOpenLibraryVolumesByQuery } = require('../controllers/open-books')

const router = express.Router()

router.get('/', mustLogin, getOpenLibraryVolumesByQuery)

module.exports = router
