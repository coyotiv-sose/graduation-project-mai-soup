const express = require('express')
const router = express.Router()
const User = require('../models/user')

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const allUsers = await User.find()

  if (req.query.json) {
    return res.send({ users: allUsers })
  }

  return res.render('users/users', { users: allUsers })
})

router.post('/', (req, res) => {
  const { username, email } = req.body
  const user = User.create({ username, email })
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

// router.post('/:id/ownedShelves', (req, res) => {
//   const { id } = req.params
//   const user = User.list.filter(u => u.username === id)[0]
//   if (!user) {
//     return res.status(404).send('User not found')
//   }

//   const { name, latitude, longitude } = req.body
//   const shelf = user.createShelf({ name, latitude, longitude })
//   res.send({
//     shelf: {
//       name: shelf.name,
//       latitude: shelf.latitude,
//       longitude: shelf.longitude,
//       owner: shelf.owner.username, // only send username to avoid circular reference
//     },
//   })
// })

module.exports = router
