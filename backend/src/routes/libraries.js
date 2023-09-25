const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')

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
  generateEnhancedDescription,
  getAllMembers,
} = require('../controllers/libraries')

router.get('/', getAllLibraries)
router.get('/:id', getSingleLibrary)

router.post('/', mustLogin, createLibrary)
router.patch('/:id', mustLogin, updateLibrary)

// TODO: this is a temporary route for testing the description enhancer
// refactor this into proper route when description enhancer is complete
router.post('/test', generateEnhancedDescription)

router.post('/:id/copies', mustLogin, addCopy)
router.delete('/:id/copies/:bookId', mustLogin, removeCopy)

router.get('/:id/members', mustLogin, getAllMembers)
router.post('/:id/members', mustLogin, joinLibrary)
router.patch('/:id/members', mustLogin, leaveLibrary)

router.patch('/:id/copies/:copyId', mustLogin, updateCopy)

module.exports = router
