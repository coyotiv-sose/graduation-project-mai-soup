const express = require('express')
const router = express.Router()
const User = require('../models/user')

/* GET users listing. */
router.get('/', (req, res, next) => {
  if (req.query.json) {
    return res.send(User.list)
  }

  return res.render('users', { users: User.list })
})

router.post('/', (req, res) => {
  const { username, email } = req.body
  const user = User.createUser({ username, email })
  res.send(user)
})

module.exports = router
