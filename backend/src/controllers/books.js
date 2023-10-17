const createError = require('http-errors')
const axios = require('axios')
const Fuse = require('fuse.js')

const BookInfo = require('../models/book-info')
const catchAsync = require('../utils/catch-async')

module.exports.getOpenLibraryBook = catchAsync(async (req, res) => {
  const { openLibraryId } = req.params

  const bookInfo = await BookInfo.findOne({ openLibraryId })
  return res.send(bookInfo)
})

module.exports.createBook = catchAsync(async (req, res, next) => {
  const { id } = req.body

  if (!id) return next(createError(400, 'Missing parameters'))

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
})

module.exports.getBooks = catchAsync(async (req, res, next) => {
  const query = req.query.q

  const books = await BookInfo.find({})

  if (query) {
    // check title and author
    // set up fuzzy search with Fuse.js
    const fuse = new Fuse(books, {
      keys: ['title', 'authors'],
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
})
