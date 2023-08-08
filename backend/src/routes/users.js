const express = require('express')

const router = express.Router()
const User = require('../models/user')

/* GET users listing. */
router.get('/', async (req, res) => {
  const allUsers = await User.find()

  if (req.query.json) {
    return res.send({ users: allUsers })
  }

  return res.render('users/users', { users: allUsers })
})

router.post('/', async (req, res) => {
  const { username, email } = req.body
  const user = await User.create({ username, email })

  // TODO: should be 201 Created
  res.send(user)
})

router.get('/:username', async (req, res) => {
  const { username } = req.params
  const user = await User.findOne({ username })
  if (!user) {
    return res.status(404).send('User not found')
  }

  if (req.query.json) {
    return res.send(user)
  }

  return res.render('users/user', { user })
})

router.post('/:username/ownedShelves', async (req, res) => {
  const { username } = req.params
  const user = await User.findOne({ username })

  if (!user) {
    return res.status(404).send('User not found')
  }

  const { name, latitude, longitude } = req.body
  const shelf = await user.createShelf({ name, latitude, longitude })
  return res.send({ shelf })
})

module.exports = router
