const express = require('express')
const { getUserByUsername } = require('../controllers/users')

const router = express.Router()

router.get('/:username', getUserByUsername)

module.exports = router
