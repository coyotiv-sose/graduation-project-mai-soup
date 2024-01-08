const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const libraryExists = require('../middleware/library-exists')
const isOwner = require('../middleware/is-owner')
const copyExists = require('../middleware/copy-exists')
const {
  validateLibrary,
  validateCopyUpdate,
} = require('../middleware/validators')

const {
  getSingleLibrary,
  getAllLibraries,
  createLibrary,
  addCopy,
  removeCopy,
  joinLibrary,
  leaveLibrary,
  updateCopy,
  updateLibrary,
  getAllMembers,
  createBook,
  removeBook,
} = require('../controllers/libraries')

router.get('/', getAllLibraries)
router.get('/:id', libraryExists, getSingleLibrary)

router.post('/', mustLogin, validateLibrary, createLibrary)
router.patch(
  '/:id',
  mustLogin,
  libraryExists,
  isOwner,
  validateLibrary,
  updateLibrary
)

router.post('/:id/copies', mustLogin, libraryExists, isOwner, addCopy)
router.delete(
  '/:id/copies/:copyId',
  mustLogin,
  libraryExists,
  isOwner,
  copyExists,
  removeCopy
)

router.get('/:id/members', mustLogin, libraryExists, getAllMembers)
router.post('/:id/members', mustLogin, libraryExists, joinLibrary)
router.patch('/:id/members', mustLogin, libraryExists, leaveLibrary)

router.patch(
  '/:id/copies/:copyId',
  mustLogin,
  libraryExists,
  copyExists,
  validateCopyUpdate,
  updateCopy
)

router.post('/:id/books', mustLogin, libraryExists, createBook)
router.delete('/:id/books/:bookId', mustLogin, libraryExists, removeBook)

module.exports = router
