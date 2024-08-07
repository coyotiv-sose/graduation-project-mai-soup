const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const bookExists = require('../middleware/book-exists')
const { getAllBooks, getSingleBook } = require('../controllers/books')

router.get('/', mustLogin, getAllBooks)

router.get('/:id', mustLogin, bookExists, getSingleBook)

module.exports = router
