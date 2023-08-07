const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'PageFlipper' })
})

router.get('/danger', async (req, res) => {
  await require('mongoose').connection.db.dropDatabase()
  res.send('danger executed')
})

module.exports = router
