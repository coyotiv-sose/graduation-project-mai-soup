const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const bookInfoExists = require('../middleware/book-info-exists')
const {
  getOpenLibraryBook,
  createBook,
  getBooks,
} = require('../controllers/books')

router.get('/:openLibraryId', mustLogin, bookInfoExists, getOpenLibraryBook)

router.post('/', mustLogin, createBook)

router.get('/', mustLogin, getBooks)

module.exports = router
