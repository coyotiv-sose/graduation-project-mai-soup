const createError = require('http-errors')
const catchAsync = require('../utils/catch-async')
const BookCopy = require('../models/book-copy')

module.exports = catchAsync(async (req, res, next) => {
  const { copyId } = req.params
  const copy = await BookCopy.findById(copyId)

  if (!copy) {
    return next(createError(404, 'Copy not found'))
  }

  return next()
})
