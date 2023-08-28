const express = require('express')
const axios = require('axios')
const ISBN = require('isbn3')

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
  // req body expected to have a google books volume info
  const { title, authors, industryIdentifiers, imageLinks } = req.body

  if (!title || !authors || !industryIdentifiers)
    return next(createError(400, 'Missing fields'))

  const isbn13 = industryIdentifiers.find(
    id => id.type === 'ISBN_13'
  ).identifier
  const isbn10 = industryIdentifiers.find(
    id => id.type === 'ISBN_10'
  ).identifier

  if (!isbn13 && !isbn10) return next(createError(400, 'Missing ISBN'))
  let book

  // try looking up book by isbn13 if available
  if (isbn13) {
    book = await BookInfo.findOne({ isbn: isbn13 })
  }

  // if none found or isbn13 wasn't available, try looking up book by isbn10
  if (!book) {
    book = await BookInfo.findOne({ isbn: isbn10 })
  }

  if (book) {
    return res.status(201).send(book)
  }

  return res.status(202).send()

  // TODO: handle the verification of new info in the frontend
  // try {
  //   const bookInfo = await BookInfo.create({ isbn, title, author })
  //   return res.status(201).send(bookInfo)
  // } catch (err) {
  //   // code 11000 represents a duplicate key error in mongo
  //   if (err.code === 11000) {
  //     return next(createError(409, 'Book already exists'))
  //   }

  //   // other errors
  //   return next(
  //     createError(
  //       500,
  //       'An error occurred while creating the book. Please try again later.'
  //     )
  //   )
  // }
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

  const response = (
    await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${
        ISBN.parse(query) ? 'isbn:' : ''
      }${query}`
    )
  ).data

  const results = response.items.map(book => book.volumeInfo)

  if (!results.length) return next(createError(404, 'No results found'))

  return res.send(results)
})

module.exports = router
