const createError = require('http-errors')
const catchAsync = require('../utils/catch-async')
const User = require('../models/user')

module.exports = catchAsync(async (req, res, next) => {
  const { username } = req.params
  const user = await User.findOne({ username })

  if (!user) {
    return next(createError(404, 'User not found'))
  }

  return next()
})
