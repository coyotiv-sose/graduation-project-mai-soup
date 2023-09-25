const createError = require('http-errors')

const User = require('../models/user')

module.exports.getUserByUsername = async (req, res, next) => {
  const { username } = req.params

  try {
    const user = await User.findOne(
      { username },
      'username memberships ownedLibraries loans'
    )

    if (!user) return next(createError(404, 'User not found'))

    return res.send(user)
  } catch (error) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the user. Please try again later.'
      )
    )
  }
}
