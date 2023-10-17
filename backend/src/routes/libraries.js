const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const libraryExists = require('../middleware/library-exists')
const isOwner = require('../middleware/is-owner')

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
} = require('../controllers/libraries')

router.get('/', getAllLibraries)
router.get('/:id', libraryExists, getSingleLibrary)

router.post('/', mustLogin, createLibrary)
router.patch('/:id', mustLogin, libraryExists, isOwner, updateLibrary)

router.post('/:id/copies', mustLogin, libraryExists, isOwner, addCopy)
router.delete(
  '/:id/copies/:bookId',
  mustLogin,
  libraryExists,
  isOwner,
  removeCopy
)

router.get('/:id/members', mustLogin, libraryExists, getAllMembers)
router.post('/:id/members', mustLogin, libraryExists, joinLibrary)
router.patch('/:id/members', mustLogin, libraryExists, leaveLibrary)

router.patch('/:id/copies/:copyId', mustLogin, libraryExists, updateCopy)

module.exports = router
