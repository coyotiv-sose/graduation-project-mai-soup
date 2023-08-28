const express = require('express')
const axios = require('axios')

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

router.post('/google-books-search', async (req, res, next) => {
  const { query } = req.body

  if (!query) return next(createError(400, 'Missing query'))

  const results = (
    await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
  ).data.items.map(book => book.volumeInfo)

  if (!results.length) return next(createError(404, 'No results found'))

  return res.send(results)
})

module.exports = router
