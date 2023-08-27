const express = require('express')

const router = express.Router()
const createError = require('http-errors')
const authenticate = require('../middleware/auth')
const User = require('../models/user')

router.get('/', (req, res) => {
  res.send(req.session)
})

router.post('/', async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    const user = await User.register({ username, email }, password)

    return res.send(user)
  } catch (err) {
    return next(createError(400, 'Registration failed'))
  }
})

router.get('/session', (req, res) => {
  res.send(req.user)
})

router.post('/session', authenticate, (req, res) => {
  res.send(req.user)
})

router.delete('/session', (req, res, next) => {
  // return to appease the eslint overlords
  return req.logout(err => {
    if (err) return next(createError(500, 'Logout failed'))

    // return to appease the eslint overlords
    return req.session.destroy(error => {
      return error
        ? next(createError(500, "Couldn't destroy session"))
        : res.sendStatus(200)
    })
  })
})

module.exports = router
