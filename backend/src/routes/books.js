const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const { getAllBooks, getSingleBook } = require('../controllers/books')

router.get('/', mustLogin, getAllBooks)

router.get('/:id', mustLogin, getSingleBook)

module.exports = router
