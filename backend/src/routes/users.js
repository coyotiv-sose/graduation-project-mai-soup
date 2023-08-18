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

// TODO: remove this route and refactor tests to use the accounts route
router.post('/', async (req, res) => {
  const { username, email } = req.body

  if (!username || !email) {
    return res.status(400).json({
      message: 'Username and email are required',
    })
  }

  try {
    const user = await User.create({ username, email })
    return res.status(201).send(user)
  } catch (err) {
    // code 11000 represents a duplicate key error in mongo
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'Username or email already exists' })
    }

    // other errors
    console.error(err)
    return res.status(500).json({
      message:
        'An error occured while adding the user. Please try again later.',
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

// TODO: kebab-case
router.post('/:username/ownedLibraries', async (req, res) => {
  const { username } = req.params
  let user

  try {
    user = await User.findOne({ username })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message:
        'An error occurred while creating the library. Please try again later.',
    })
  }

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    })
  }

  const { name, latitude, longitude } = req.body

  // can't check for !name || !latitude || !longitude because latitude and longitude can be 0
  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      message: 'Name, latitude, and longitude are required',
    })
  }

  let library

  try {
    library = await user.createLibrary({ name, latitude, longitude })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message:
        'An error occurred while creating the library. Please try again later.',
    })
  }

  return res.status(201).send(library)
})

module.exports = router
