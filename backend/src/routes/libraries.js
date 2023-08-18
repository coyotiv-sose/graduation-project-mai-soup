const express = require('express')
const createError = require('http-errors')

const router = express.Router()
const Library = require('../models/library')
const descriptionEnhancer = require('../lib/description-enhancer')

router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const library = await Library.findById(id)

    if (!library) {
      return res.status(404).json({
        message: 'Library not found',
      })
    }

    return res.send(library)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message:
        'An error occurred while retrieving the library. Please try again later.',
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const libraries = await Library.find()
    return res.send(libraries)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message:
        'An error occurred while retrieving the libraries. Please try again later.',
    })
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

  return res.send(library)
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

module.exports = router
