const express = require('express')

const router = express.Router()
const createError = require('http-errors')
const BookInfo = require('../models/book-info')

router.get('/:isbn', async (req, res, next) => {
  const { isbn } = req.params

  try {
    const bookInfo = await BookInfo.findOne({ isbn })

    if (!bookInfo) return next(createError(404, 'Book not found'))

    return res.send(bookInfo)
  } catch (err) {
    return next(
      createError(
        500,
        "An error occurred while retrieving the book's info. Please try again later."
      )
    )
  }
})

router.post('/', async (req, res, next) => {
  const { isbn, title, author } = req.body

  if (!isbn || !title || !author)
    return next(createError(400, 'Missing fields'))

  try {
    const bookInfo = await BookInfo.create({ isbn, title, author })
    return res.status(201).send(bookInfo)
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

router.get('/', async (req, res, next) => {
  try {
    const books = await BookInfo.find({})
    return res.send(books)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the book infos. Please try again later.'
      )
    )
  }
})

module.exports = router
