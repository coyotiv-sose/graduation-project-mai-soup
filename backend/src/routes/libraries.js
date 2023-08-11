const express = require('express')

const router = express.Router()
const Library = require('../models/library')

router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const library = await Library.findById(id)

    if (!library) {
      return res.status(404).send('Library not found')
    }

    return res.send(library)
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .send(
        'An error occurred while retrieving the library. Please try again later.'
      )
  }
})

module.exports = router
