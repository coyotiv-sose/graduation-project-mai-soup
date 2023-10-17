const catchAsync = require('../utils/catch-async')
const User = require('../models/user')

module.exports.getUserByUsername = catchAsync(async (req, res) => {
  const { username } = req.params
  const user = await User.findOne(
    { username },
    'username memberships ownedLibraries loans'
  )

  return res.send(user)
})
