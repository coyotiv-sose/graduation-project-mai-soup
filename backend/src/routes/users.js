const express = require('express')
const { getUserByUsername } = require('../controllers/users')
const userExists = require('../middleware/user-exists')

const router = express.Router()

router.get('/:username', userExists, getUserByUsername)

module.exports = router
