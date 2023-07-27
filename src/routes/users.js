const express = require('express')
const router = express.Router()
const User = require('../models/user')

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send(User.list)
})

router.post('/', (req, res) => {
  const { username, email } = req.body
  const user = User.createUser({ username, email })
  res.send(user)
})

module.exports = router
