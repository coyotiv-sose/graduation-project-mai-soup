const express = require('express')
const passport = require('passport')

const router = express.Router()

const {
  registerUser,
  getAuthenticatedUser,
  logoutAndDestroySession,
} = require('../controllers/accounts')

router.post('/', registerUser)

router.get('/session', getAuthenticatedUser)

router.post(
  '/session',
  passport.authenticate('local', { failWithError: true }),
  getAuthenticatedUser
)

router.delete('/session', logoutAndDestroySession)

module.exports = router
