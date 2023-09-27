const createError = require('http-errors')

const User = require('../models/user')

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    const user = await User.register({ username, email }, password)

    return res.send(user)
  } catch (err) {
    return next(createError(400, 'Registration failed'))
  }
}

module.exports.getAuthenticatedUser = (req, res) => {
  return res.send(req.user)
}

module.exports.logoutAndDestroySession = (req, res, next) => {
  // return to appease the eslint overlords
  return req.logout(err => {
    if (err) return next(createError(500, 'Logout failed'))

    // return to appease the eslint overlords
    return res.sendStatus(200)
  })
}
