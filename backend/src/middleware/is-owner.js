const createError = require('http-errors')
const catchAsync = require('../utils/catch-async')
const Library = require('../models/library')

module.exports = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const library = await Library.findById(id)

  if (!library.owner._id.equals(req.user._id)) {
    return next(createError(403, 'Not authorized to access this library'))
  }

  return next()
})
