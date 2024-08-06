const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const libraryExists = require('../middleware/library-exists')
const isOwner = require('../middleware/is-owner')
const { validateLibrary } = require('../middleware/validators')
const { singleFile } = require('../middleware/multer')

const {
  getSingleLibrary,
  getAllLibraries,
  createLibrary,
  joinLibrary,
  leaveLibrary,
  updateBook,
  updateLibrary,
  getAllMembers,
  createBook,
  removeBook,
  deleteLibrary,
} = require('../controllers/libraries')
const fileIsImage = require('../middleware/fileIsImage')

router.get('/', getAllLibraries)
router.get('/:id', libraryExists, getSingleLibrary)

router.post(
  '/',
  mustLogin,
  singleFile,
  validateLibrary,
  fileIsImage,
  createLibrary
)
router.patch(
  '/:id',
  mustLogin,
  libraryExists,
  isOwner,
  validateLibrary,
  updateLibrary
)
router.delete('/:id', mustLogin, libraryExists, isOwner, deleteLibrary)

router.get('/:id/members', mustLogin, libraryExists, getAllMembers)
router.post('/:id/members', mustLogin, libraryExists, joinLibrary)
router.patch('/:id/members', mustLogin, libraryExists, leaveLibrary)

router.post('/:id/books', mustLogin, libraryExists, isOwner, createBook)
router.patch('/:id/books/:bookId', mustLogin, libraryExists, updateBook)
router.delete(
  '/:id/books/:bookId',
  mustLogin,
  libraryExists,
  isOwner,
  removeBook
)

module.exports = router
