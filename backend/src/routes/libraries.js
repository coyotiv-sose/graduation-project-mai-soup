const express = require('express')

const router = express.Router()
const Library = require('../models/library')

router.get('/:id', async (req, res) => {
  const { id } = req.params

  const library = await Library.findById(id)

  if (!library) {
    return res.status(404).send('Library not found')
  }

  return res.send(library)
})

module.exports = router
