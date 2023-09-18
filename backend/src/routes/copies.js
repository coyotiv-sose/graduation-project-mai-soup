const express = require('express')

const router = express.Router()
const createError = require('http-errors')
const mustLogin = require('../middleware/must-login')
const BookCopy = require('../models/book-copy')

// TODO: refactor routes to libraries routes, as book copies
// should not exist without a library
router.get('/:id', mustLogin, async (req, res, next) => {
  const { id } = req.params

  try {
    const bookCopy = BookCopy.findById(id)
    return res.send(bookCopy)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the book copy. Please try again later.'
      )
    )
  }
})

module.exports = router
