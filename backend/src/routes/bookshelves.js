const express = require('express')

const router = express.Router()
const Bookshelf = require('../models/bookshelf')

router.get('/:id', (req, res) => {
  // decode URI component for each param
  // since name can contain spaces, etc.
  // TODO: that's not how you do it, fix
  Object.keys(req.params).forEach(p => {
    req.params.p = decodeURIComponent(req.params.p)
  })
  const { id } = req.params

  const shelf = Bookshelf.list.filter(s => s.name === id)[0]
  // only send username to avoid circular reference
  const owner = shelf.owner.username
  const subscribers = shelf.subscribers.map(s => s.username)
  if (!shelf) {
    return res.status(404).send('Bookshelf not found')
  }
  console.log(subscribers)

  if (req.query.json) {
    return res.send({ ...shelf, owner, subscribers })
  }

  return res.render('bookshelves/bookshelf', {
    shelf: { ...shelf, owner, subscribers },
  })
})

module.exports = router
