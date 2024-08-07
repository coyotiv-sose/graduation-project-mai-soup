const catchAsync = require('../utils/catch-async')
const Book = require('../models/book')

module.exports.getSingleBook = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const book = await Book.findById(id)

  return res.send(book)
})

module.exports.getAllBooks = catchAsync(async (req, res) => {
  const books = await Book.find()
  return res.send(books)
})
