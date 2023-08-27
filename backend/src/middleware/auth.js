const createError = require('http-errors')
const validator = require('email-validator')
const User = require('../models/user')

module.exports = async (req, res, next) => {
  // check for "identifier" and "password" properties in req.body
  const { identifier, password } = req.body
  if (!identifier || !password) {
    return next(createError(400, 'Identifier and password required'))
  }

  let user

  // check if identifier is a valid email
  if (validator.validate(identifier)) {
    // find user by email
    user = await User.findOne({ email: identifier })
  }

  // identifier wasn't a valid email or user not found by email
  // try finding user by username
  if (!user) {
    user = await User.findOne({ username: identifier })
  }

  // if no such user exists, throw error
  if (!user) {
    return next(createError(401, 'Invalid crendentials'))
  }

  // attempt to authenticate user and set req.user
  try {
    await user.authenticate(password)
    req.user = user
    return next()
  } catch (err) {
    return next(createError(401, 'Invalid credentials'))
  }
}
