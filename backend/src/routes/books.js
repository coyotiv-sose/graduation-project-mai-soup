const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const Book = require('../models/book')

router.get('/:isbn', async (req, res, next) => {
  const { isbn } = req.params

  try {
    const book = await Book.findOne({ isbn })

    if (!book) return next(createError(404, 'Book not found'))

    return res.send(book)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the book. Please try again later.'
      )
    )
  }
})

router.post('/', async (req, res, next) => {
  const { isbn, title, author } = req.body

  if (!isbn || !title || !author)
    return next(createError(400, 'Missing fields'))

  try {
    const book = await Book.create({ isbn, title, author })
    return res.status(201).send(book)
  } catch (err) {
    // code 11000 represents a duplicate key error in mongo
    if (err.code === 11000) {
      return next(createError(409, 'Book already exists'))
    }

    // other errors
    return next(
      createError(
        500,
        'An error occurred while creating the book. Please try again later.'
      )
    )
  }
})

module.exports = router
