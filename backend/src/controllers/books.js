const createError = require('http-errors')
const axios = require('axios')
const Fuse = require('fuse.js')

const BookInfo = require('../models/book-info')
const catchAsync = require('../utils/catch-async')
const Book = require('../models/book')

module.exports.getSingleBook = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const book = await Book.findById(id)

  if (!book) return next(createError(404, 'Book not found'))
  return res.send(book)
})

module.exports.getAllBooks = catchAsync(async (req, res) => {
  const books = await Book.find()
  return res.send(books)
})
