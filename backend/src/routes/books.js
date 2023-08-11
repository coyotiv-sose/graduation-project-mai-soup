const express = require('express')

const router = express.Router()
const Book = require('../models/book')

router.get('/:isbn', (req, res) => {
  const { isbn } = req.params

  try {
    const book = Book.findOne({ isbn })

    if (!book) {
      return res.status(404).json({
        message: 'Book not found',
      })
    }

    return res.send(book)
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .json({ message: 'An error occurred while retrieving the book' })
  }
})

router.post('/', async (req, res) => {
  const { isbn, title, author } = req.body

  if (!isbn || !title || !author) {
    return res.status(400).json({
      message: 'ISBN, title, and author are required',
    })
  }

  try {
    const book = await Book.create({ isbn, title, author })
    return res.status(201).send(book)
  } catch (err) {
    // code 11000 represents a duplicate key error in mongo
    if (err.code === 11000) {
      return res.status(409).json({ message: 'ISBN already exists' })
    }

    // other errors
    console.error(err)
    return res.status(500).json({
      message:
        'An error occured while adding the book. Please try again later.',
    })
  }
})

module.exports = router
