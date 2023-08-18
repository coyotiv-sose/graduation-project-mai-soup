const express = require('express')

const router = express.Router()
const User = require('../models/user')

router.get('/', async (req, res) => {
  try {
    const allUsers = await User.find()
    return res.send(allUsers)
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message:
        'An error occurred while retrieving the users. Please try again later.',
    })
  }
})

router.get('/:username', async (req, res) => {
  const { username } = req.params

  try {
    const user = await User.findOne({ username })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    return res.send(user)
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message:
        'An error occurred while retrieving the user. Please try again later.',
    })
  }
})

module.exports = router
