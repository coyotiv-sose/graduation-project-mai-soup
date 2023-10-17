const createError = require('http-errors')
const catchAsync = require('../utils/catch-async')
const BookInfo = require('../models/book-info')

module.exports = catchAsync(async (req, res, next) => {
  const { openLibraryId } = req.params
  const info = await BookInfo.findOne({ openLibraryId })

  if (!info) {
    return next(createError(404, 'Book info not found'))
  }

  return next()
})
