const express = require('express')
const axios = require('axios')
const ISBN = require('isbn3')
const Fuse = require('fuse.js')

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

// TODO: change to only expect a google book id
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
  const query = req.query.q

  try {
    const books = await BookInfo.find({})

    if (query) {
      // is the query an isbn?
      const isbn = ISBN.parse(query)
      if (isbn) {
        const book = books.find(
          b => b.isbn === isbn.isbn13 || b.isbn === isbn.isbn10
        )

        if (!book) return next(createError(404, 'No results found'))
        return res.send([book])
      }
      // since not an isbn, check title and author
      // set up fuzzy search with Fuse.js
      const fuse = new Fuse(books, {
        keys: ['title', 'author'],
      })

      const results = fuse.search(query)

      if (results.length === 0) {
        return next(createError(404, 'No results found'))
      }

      const bestMatches = results.map(result => result.item) // get the actual book objects

      return res.send(bestMatches)
    }

    // no query, return all books
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
