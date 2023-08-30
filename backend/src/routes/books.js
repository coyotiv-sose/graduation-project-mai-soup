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

router.post('/', async (req, res, next) => {
  const { id } = req.body

  if (!id) return next(createError(400, 'Missing parameters'))

  try {
    // check if volume already exists in db
    const book = await BookInfo.findOne({ openLibraryId: id })
    if (book) {
      return res.status(409).send(book)
    }

    // fetch book info from OpenLibrary API
    const volume = await axios.get(`https://openlibrary.org/works/${id}.json`)
    // TODO: handle errors

    const { title, covers, authors } = volume.data

    // convert author objects to author names
    const authorIds = authors.map(item => item.author.key)

    const authorNames = await Promise.all(
      authorIds.map(async a => {
        const author = await axios.get(`https://openlibrary.org${a}.json`)
        console.error(a)
        return author.data.name
      })
    )
    // construct bookInfo
    const newBook = await BookInfo.create({
      openLibraryId: id,
      title,
      authors: [...new Set(authorNames)], // remove duplicate authors
      imageUrl: covers
        ? `https://covers.openlibrary.org/b/id/${covers[0]}-M.jpg`
        : null,
    })

    return res.status(201).send(newBook)
  } catch (err) {
    console.error(err)
    return next(createError(500, 'Error adding book'))
  }
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
