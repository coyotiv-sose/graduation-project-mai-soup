const express = require('express')
const router = express.Router()
const User = require('../models/user')

/* GET users listing. */
router.get('/', (req, res, next) => {
  if (req.query.json) {
    return res.send(User.list)
  }

  return res.render('users/users', { users: User.list })
})

router.post('/', (req, res) => {
  const { username, email } = req.body
  const user = User.createUser({ username, email })
  res.send(user)
})

router.get('/:id', (req, res) => {
  const { id } = req.params
  const user = User.list.filter(u => u.username === id)[0]
  if (!user) {
    return res.status(404).send('User not found')
  }

  if (req.query.json) {
    return res.send(user)
  }

  return res.render('users/user', { user })
})

module.exports = router
