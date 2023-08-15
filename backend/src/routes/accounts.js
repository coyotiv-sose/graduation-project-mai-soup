const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')

router.get('/', (req, res) => {
  res.send(req.session)
})

router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const user = await User.register({ username, email }, password)

    return res.send(user)
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' })
  }
})

router.get('/session', (req, res) => {
  res.send(req.user)
})

router.post(
  '/session',
  passport.authenticate('local', { failWithError: true }),
  (req, res) => {
    res.send(req.user)
  }
)

router.delete('/session', (req, res) => {
  req.logout()
  res.sendStatus(200)
})

module.exports = router
