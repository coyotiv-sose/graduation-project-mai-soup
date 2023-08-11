const express = require('express')

const router = express.Router()
const Book = require('../models/book')

router.get('/:isbn', (req, res) => {
  const { isbn } = req.params

  try {
    const book = Book.findOne({ isbn })

    if (!book) {
      return res.status(404).send('Book not found')
    }

    return res.send(book)
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .send(
        'An error occurred while retrieving the book. Please try again later.'
      )
  }
})

router.post('/', async (req, res) => {
  const { isbn, title, author } = req.body

  if (!isbn || !title || !author) {
    return res.status(400).send('ISBN, title, and author are required')
  }

  try {
    const book = await Book.create({ isbn, title, author })
    return res.status(201).send(book)
  } catch (err) {
    // code 11000 represents a duplicate key error in mongo
    if (error.code === 11000) {
      return res.status(409).json({ error: 'ISBN already exists' })
    }

    // other errors
    console.error(error)
    res
      .status(500)
      .json({
        error:
          'An error occured while adding the book. Please try again later.',
      })
  }
})

module.exports = router
