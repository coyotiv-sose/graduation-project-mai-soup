const express = require('express')

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
