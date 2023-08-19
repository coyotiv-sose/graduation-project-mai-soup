const express = require('express')
const createError = require('http-errors')

const router = express.Router()
const Library = require('../models/library')
const Book = require('../models/book')
const descriptionEnhancer = require('../lib/description-enhancer')

router.get('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const library = await Library.findById(id)

    if (!library) return next(createError(404, 'Library not found'))

    return res.send(library)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the library. Please try again later.'
      )
    )
  }
})

router.get('/', async (req, res, next) => {
  try {
    const libraries = await Library.find()
    return res.send(libraries)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the libraries. Please try again later.'
      )
    )
  }
})

router.post('/', async (req, res, next) => {
  const owner = req.user

  // only logged in users can create libraries
  if (!owner)
    return next(createError(401, 'You must be logged in to create a library'))
  const { name, latitude, longitude } = req.body
  // can't check for !name || !latitude || !longitude because latitude and longitude can be 0
  if (!name || latitude === undefined || longitude === undefined)
    return next(createError(400, 'Name, latitude, and longitude are required'))

  const library = await Library.create({
    name,
    latitude,
    longitude,
    owner,
  })

  owner.ownedLibraries.push(library)
  owner.memberships.push(library)
  await owner.save()

  return res.status(201).send(library)
})

router.post('/test', async (req, res) => {
  const { description } = req.body
  if (!description) {
    return res.status(400).json({
      message: 'Please provide a description',
    })
  }
  const enhancedDescription = await descriptionEnhancer(description)
  return res.send(enhancedDescription)
})

router.post('/:id/books', async (req, res, next) => {
  const { id } = req.params
  const { isbn } = req.body

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  const book = await Book.findOne({ isbn })
  if (!book) return next(createError(404, 'Book not found'))

  try {
    await library.addBook(book)
    return res.status(201).send(library)
  } catch (err) {
    return next(createError(500, err.message))
  }
})

module.exports = router
