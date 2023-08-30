const express = require('express')
const axios = require('axios')
const ISBN = require('isbn3')
const createError = require('http-errors')

const router = express.Router()

router.get('/', async (req, res, next) => {
  const query = req.query.q

  if (!query) return next(createError(400, 'Missing query'))

  const response = (
    await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${
        ISBN.parse(query) ? 'isbn:' : ''
      }${query}`
    )
  ).data

  // TODO: send whole book, can use id for lookup later
  const results = response.items.map(book => book.volumeInfo)

  if (!results.length) return next(createError(404, 'No results found'))

  return res.send(results)
})

module.exports = router
