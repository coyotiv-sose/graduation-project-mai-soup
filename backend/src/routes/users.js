const express = require('express')

const router = express.Router()
const createError = require('http-errors')
const User = require('../models/user')

router.get('/', async (req, res, next) => {
  try {
    const allUsers = await User.find()
    return res.send(allUsers)
  } catch (error) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the users. Please try again later.'
      )
    )
  }
})

router.get('/:username', async (req, res, next) => {
  const { username } = req.params

  try {
    const user = await User.findOne({ username })

    if (!user) return next(createError(404, 'User not found'))

    return res.send(user)
  } catch (error) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the user. Please try again later.'
      )
    )
  }
})

module.exports = router
