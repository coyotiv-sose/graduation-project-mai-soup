const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'PageFlipper' })
})

router.get('/danger', async (req, res) => {
  await mongoose.connection.db.dropDatabase()
  res.send('danger executed')
})

module.exports = router
