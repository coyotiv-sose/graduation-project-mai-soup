const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const Library = require('../models/library')
const BookInfo = require('../models/book-info')
const BookCopy = require('../models/book-copy')

router.get('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const bookCopy = BookCopy.findById(id)
    res.send(bookCopy)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the book copy. Please try again later.'
      )
    )
  }
})

router.post('/:isbn', async (req, res, next) => {
  const { isbn } = req.params
  const { libraryId } = req.body
  let bookInfo, library

  try {
    bookInfo = await BookInfo.findOne({ isbn })
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the book info. Please try again later.'
      )
    )
  }

  if (!bookInfo) {
    return next(createError(404, 'Book info not found'))
  }

  try {
    library = await Library.findById(libraryId)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the library. Please try again later.'
      )
    )
  }

  if (!library) {
    return next(createError(404, 'Library not found'))
  }

  try {
    const bookCopy = await BookCopy.create({
      bookInfo,
      library,
    })
    return res.status(201).send(bookCopy)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while creating the book copy. Please try again later.'
      )
    )
  }
})

router.patch('/:id', async (req, res, next) => {
  // 3 actions - borrow, return, mark as lost
  const { id } = req.params
  const { action } = req.body

  if (!action) {
    return next(createError(400, 'Missing action'))
  }

  try {
    const bookCopy = await BookCopy.findById(id)

    switch (action) {
      case 'borrow':
        await bookCopy.borrow()
        return res.send(bookCopy)
      case 'return':
        await bookCopy.return()
        return res.send(bookCopy)
      case 'lose':
        await bookCopy.lose()
        return res.send(bookCopy)
      default:
        return next(createError(400, 'Invalid action'))
    }
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while updating the book copy. Please try again later.'
      )
    )
  }
})

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    await BookCopy.findByIdAndDelete(id)
    return res.status(204).send()
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while deleting the book copy. Please try again later.'
      )
    )
  }
})

module.exports = router
