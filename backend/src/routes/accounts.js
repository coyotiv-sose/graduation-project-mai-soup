const express = require('express')
const passport = require('passport')

const mustLogin = require('../middleware/must-login')
const { validateNewAccount } = require('../middleware/validators')

const router = express.Router()

const {
  registerUser,
  getAuthenticatedUser,
  logoutAndDestroySession,
} = require('../controllers/accounts')

router.post('/', validateNewAccount, registerUser)

router.get('/session', getAuthenticatedUser)

router.post(
  '/session',
  passport.authenticate('local', { failWithError: true }),
  getAuthenticatedUser
)

router.delete('/session', mustLogin, logoutAndDestroySession)

module.exports = router
