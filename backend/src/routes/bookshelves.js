const express = require('express')

const router = express.Router()
const Bookshelf = require('../models/bookshelf')

router.get('/:id', async (req, res) => {
  const { id } = req.params

  const shelf = await Bookshelf.findById(id)

  if (!shelf) {
    return res.status(404).send('Bookshelf not found')
  }

  return res.send(shelf)
})

module.exports = router
