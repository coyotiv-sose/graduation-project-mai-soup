const createError = require('http-errors')
const catchAsync = require('../utils/catch-async')
const Library = require('../models/library')

module.exports = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const library = await Library.findById(id)

  if (!library) {
    return next(createError(404, 'Library not found'))
  }

  return next()
})
