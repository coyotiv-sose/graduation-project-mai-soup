const createError = require('http-errors')
const Library = require('../models/library')
const Book = require('../models/book')
const User = require('../models/user')
const descriptionEnhancer = require('../lib/description-enhancer')
const { getGeometryOfLocation } = require('../lib/geocoder')
const catchAsync = require('../utils/catch-async')

module.exports.getSingleLibrary = catchAsync(async (req, res) => {
  const { id } = req.params
  const library = await Library.findById(id)

  return res.send(library)
})

module.exports.getAllLibraries = catchAsync(async (req, res) => {
  const libraries = await Library.find()
  return res.send(libraries)
})

module.exports.createLibrary = catchAsync(async (req, res) => {
  const owner = await User.findById(req.user.id)
  const { name, location } = req.body
  const geometry = await getGeometryOfLocation(location)
  let filetype
  let encodedImage
  if (req.file) {
    filetype = req.file.mimetype
    encodedImage = req.file.buffer.toString('base64')
  }

  const library = await owner.createLibrary({
    name,
    location,
    coordinates: geometry.coordinates,
    image: {
      filetype,
      data: encodedImage,
    },
  })

  return res.status(201).send(library)
})

module.exports.joinLibrary = catchAsync(async (req, res) => {
  const { id } = req.params
  const { user } = req

  const library = await Library.findById(id)

  await user.joinLibrary(library)
  return res.status(201).send(library)
})

// TODO: refactor to user controller and route
module.exports.leaveLibrary = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { user } = req
  const library = await Library.findById(id)

  if (req.body.remove) {
    await user.leaveLibrary(library)
    return res.status(204).send()
  }

  return next(createError(400, 'Invalid request'))
})

module.exports.getAllMembers = catchAsync(async (req, res) => {
  const { id } = req.params

  const library = await Library.findById(id)

  const { members } = library
  return res.send(members)
})

module.exports.updateBook = catchAsync(async (req, res, next) => {
  const { bookId } = req.params
  const { action } = req.body
  const { user } = req

  const book = await Book.findById(bookId)

  if (!book) return next(createError(404, 'Book not found'))

  try {
    switch (action) {
      case 'borrow':
        await user.borrowBook(book)
        break
      case 'return':
        await user.returnBook(book)
        break
      case 'extend':
        await book.extend()
        break
      case 'lose':
        await book.lose()
        break
      default:
        return next(createError(400, 'Invalid action'))
    }
  } catch (err) {
    return next(createError(403, err.message))
  }
  const updatedBook = await Book.findById(bookId)
  return res.send(updatedBook)
})

module.exports.updateLibrary = catchAsync(async (req, res) => {
  const libraryId = req.params.id
  const { name, location } = req.body

  const library = await Library.findById(libraryId)

  // update only the fields that have changed
  if (library.name !== name) library.name = name

  if (library.location !== location) {
    library.location = location

    const geometry = await getGeometryOfLocation(location)

    // update geometry
    library.geometry = geometry
  }

  const updatedLibrary = await library.save()

  return res.status(200).send(updatedLibrary)
})

module.exports.generateEnhancedDescription = catchAsync(
  async (req, res, next) => {
    const { description } = req.body
    if (!description) {
      return next(createError(400, 'Missing description'))
    }
    const enhancedDescription = await descriptionEnhancer(description)
    return res.send(enhancedDescription)
  }
)

module.exports.createBook = catchAsync(async (req, res, next) => {
  const { authors, title } = req.body

  if (!authors || !title) return next(createError(400, 'Missing parameters'))

  const library = await Library.findById(req.params.id)
  const book = await library.addBook({ title, authors })

  return res.status(201).send(book)
})

module.exports.removeBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.bookId)
  if (!book) return next(createError(404, 'Book not found'))

  const library = await Library.findById(req.params.id)
  await library.removeBook(book)

  return res.status(204).send()
})

module.exports.deleteLibrary = catchAsync(async (req, res) => {
  const owner = await User.findById(req.user.id)
  await owner.deleteLibrary(req.params.id)

  return res.status(204).send()
})
