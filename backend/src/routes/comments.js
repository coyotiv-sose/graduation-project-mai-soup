const express = require('express')
const router = express.Router({ mergeParams: true })
const mustLogin = require('../middleware/must-login')

const {
  getLibraryComments,
  getSingleComment,
  createComment,
  deleteComment,
} = require('../controllers/comments')

router.get('/', getLibraryComments)
router.get('/:commentId', getSingleComment)

router.post('/', mustLogin, createComment)

router.delete('/:commentId', mustLogin, deleteComment)

module.exports = router
