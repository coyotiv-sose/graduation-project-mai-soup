const express = require('express')

const router = express.Router()
const User = require('../models/user')

/* GET users listing. */
router.get('/', async (req, res) => {
  const allUsers = await User.find()

  return res.send({ users: allUsers })
})

router.post('/', async (req, res) => {
  const { username, email } = req.body
  const user = await User.create({ username, email })

  res.status(201).send(user)
})

router.get('/:username', async (req, res) => {
  const { username } = req.params
  const user = await User.findOne({ username })
  if (!user) {
    return res.status(404).send('User not found')
  }

  return res.send(user)
})

router.post('/:username/ownedLibraries', async (req, res) => {
  const { username } = req.params
  const user = await User.findOne({ username })

  if (!user) {
    return res.status(404).send('User not found')
  }

  const { name, latitude, longitude } = req.body
  const library = await user.createLibrary({ name, latitude, longitude })

  return res.status(201).send({ library })
})

module.exports = router
