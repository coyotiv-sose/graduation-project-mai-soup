const express = require('express')
const createError = require('http-errors')
const axios = require('axios')

const router = express.Router()
const Library = require('../models/library')
const BookInfo = require('../models/book-info')
const BookCopy = require('../models/book-copy')
const User = require('../models/user')
const descriptionEnhancer = require('../lib/description-enhancer')

router.get('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const library = await Library.findById(id)

    if (!library) return next(createError(404, 'Library not found'))

    return res.send(library)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the library. Please try again later.'
      )
    )
  }
})

router.get('/', async (req, res, next) => {
  try {
    const libraries = await Library.find()
    return res.send(libraries)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the libraries. Please try again later.'
      )
    )
  }
})

router.post('/', async (req, res, next) => {
  const owner = req.user

  // only logged in users can create libraries
  if (!owner)
    return next(createError(401, 'You must be logged in to create a library'))
  const { name, latitude, longitude } = req.body
  // can't check for !name || !latitude || !longitude because latitude and longitude can be 0
  if (!name || latitude === undefined || longitude === undefined)
    return next(createError(400, 'Name, latitude, and longitude are required'))

  const library = await Library.create({
    name,
    latitude,
    longitude,
    owner,
  })

  owner.ownedLibraries.push(library)
  owner.memberships.push(library)
  await owner.save()

  return res.status(201).send(library)
})

router.post('/test', async (req, res) => {
  const { description } = req.body
  if (!description) {
    return res.status(400).json({
      message: 'Please provide a description',
    })
  }
  const enhancedDescription = await descriptionEnhancer(description)
  return res.send(enhancedDescription)
})

router.post('/:id/copies', async (req, res, next) => {
  const { id } = req.params
  const { openLibraryId } = req.body

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  let book = await BookInfo.findOne({ openLibraryId })
  if (!book) {
    // add from OpenLibrary API if not found locally
    const volume = await axios.get(`https://openlibrary.org/works/${id}.json`)
    // TODO: handle errors

    const { title, covers, authors } = volume.data

    // convert author objects to author names
    const authorIds = authors.map(item => item.author.key)

    const authorNames = await Promise.all(
      authorIds.map(async a => {
        const author = await axios.get(`https://openlibrary.org${a}.json`)
        console.error(a)
        return author.data.name
      })
    )
    // construct bookInfo
    // TODO: error handling
    book = await BookInfo.create({
      openLibraryId: id,
      title,
      authors: [...new Set(authorNames)], // remove duplicate authors
      imageUrl: covers
        ? `https://covers.openlibrary.org/b/id/${covers[0]}-M.jpg`
        : null,
    })
  }

  try {
    await library.addBook(book)
    return res.status(201).send(library)
  } catch (err) {
    return next(createError(500, err.message))
  }
})

router.delete('/:id/books/:bookId', async (req, res, next) => {
  const { id, bookId } = req.params

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  const book = await BookCopy.findById(bookId)
  if (!book) return next(createError(404, 'Book not found'))

  try {
    await library.removeBookCopy(book)
    return res.status(204).send()
  } catch (err) {
    return next(createError(500, err.message))
  }
})

router.get('/:id/members', async (req, res, next) => {
  const { id } = req.params

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  try {
    const { members } = library
    return res.send(members)
  } catch (err) {
    return next(createError(500, err.message))
  }
})

router.post('/:id/members', async (req, res, next) => {
  const { id } = req.params
  const { user } = req

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  const newMember = await User.findOne({ username: user?.username })
  if (!newMember) return next(createError(404, 'User not found'))

  try {
    await newMember.joinLibrary(library)
    return res.status(201).send(library)
  } catch (err) {
    return next(createError(500, err.message))
  }
})

router.patch('/:id/members', async (req, res, next) => {
  const { id } = req.params
  const { user } = req

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  if (req.body.remove) {
    const userToRemove = await User.findOne({ username: user?.username })
    if (!userToRemove) return next(createError(404, 'User not found'))

    try {
      await userToRemove.leaveLibrary(library)
      return res.status(204).send()
    } catch (err) {
      console.error(err)
      return next(createError(500, err.message))
    }
  } else {
    return next(createError(400, 'Invalid request'))
  }
})

module.exports = router
