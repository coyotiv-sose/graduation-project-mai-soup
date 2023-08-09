const express = require('express')

const router = express.Router()
const Book = require('../models/book')

router.get('/:isbn', (req, res) => {
  const { isbn } = req.params
  const book = Book.findOne({ isbn })

  if (!book) {
    return res.status(404).send('Book not found')
  }

  return res.send(book)
})

router.post('/', async (req, res) => {
  const { isbn, title, author } = req.body
  const book = new Book({ isbn, title, author })

  await book.save()

  // TODO: 201 Created
  return res.send(book)
})

module.exports = router
