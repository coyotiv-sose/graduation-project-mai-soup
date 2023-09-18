const express = require('express')

const router = express.Router()
const createError = require('http-errors')
const mustLogin = require('../middleware/must-login')
const BookCopy = require('../models/book-copy')

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

router.patch('/:id', mustLogin, async (req, res, next) => {
  const { id } = req.params
  const { action } = req.body
  const { user } = req

  if (!user) {
    return next(createError(401, 'Unauthorized'))
  }

  const bookCopy = await BookCopy.findById(id)

  if (!bookCopy) {
    return next(createError(404, 'Book copy not found'))
  }

  try {
    switch (action) {
      case 'borrow':
        await user.borrowBook(bookCopy)
        return res.send(bookCopy)
      case 'return':
        await user.returnBook(bookCopy)
        return res.send(bookCopy)
      case 'extend':
        await bookCopy.extend()
        return res.send(bookCopy)
      case 'lose':
        await bookCopy.lose()
        return res.send(bookCopy)
      default:
        return next(createError(400, 'Invalid action'))
    }
  } catch (err) {
    console.error(err)
    return next(
      createError(
        500,
        'An error occurred while updating the book copy. Please try again later.'
      )
    )
  }
})

module.exports = router
