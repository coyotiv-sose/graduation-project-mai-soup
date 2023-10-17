const createError = require('http-errors')
const User = require('../models/user')

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    const user = await User.register({ username, email }, password)

    return res.send(user)
  } catch (err) {
    if (
      err.name === 'ValidationError' ||
      err.code === 11000 ||
      err.name === 'UserExistsError'
    ) {
      // handle validation or duplicate key errors separately
      return next(createError(400, 'Registration failed'))
    }
    return next(createError(500, err))
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
