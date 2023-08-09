const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

router.get('/danger', async (req, res) => {
  await mongoose.connection.db.dropDatabase()
  res.send('danger executed')
})

module.exports = router
