const createError = require('http-errors')
const catchAsync = require('../utils/catch-async')
const Book = require('../models/book')

module.exports = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const book = await Book.findById(id)

  if (!book) {
    return next(createError(404, 'Book not found'))
  }

  return next()
})
