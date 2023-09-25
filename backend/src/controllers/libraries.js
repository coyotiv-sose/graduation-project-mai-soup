const createError = require('http-errors')
const axios = require('axios')

const Library = require('../models/library')
const BookInfo = require('../models/book-info')
const BookCopy = require('../models/book-copy')
const User = require('../models/user')
const { uploadImage, deleteImage } = require('../lib/google-cloud-storage')
const descriptionEnhancer = require('../lib/description-enhancer')
const { getGeometryOfLocation } = require('../lib/geocoder')

module.exports.getSingleLibrary = async (req, res, next) => {
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
}

module.exports.getAllLibraries = async (req, res, next) => {
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
}

module.exports.createLibrary = async (req, res, next) => {
  const owner = req.user

  const { name, location } = req.body
  if (!name || !location)
    return next(createError(400, 'Name and location are required'))

  try {
    const geometry = await getGeometryOfLocation(location)

    const library = await Library.create({
      name,
      geometry,
      location,
      owner,
    })

    owner.ownedLibraries.push(library)
    owner.memberships.push(library)
    await owner.save()

    return res.status(201).send(library)
  } catch (err) {
    console.error(err)
    return next(createError(500, 'Error creating library'))
  }
}

module.exports.addCopy = async (req, res, next) => {
  const { id } = req.params
  const { openLibraryId } = req.body

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  // only library owner can add copies
  const { user } = req
  if (user.id !== library.owner.id)
    return next(createError(403, 'You are not the owner of this library'))

  let book = await BookInfo.findOne({ openLibraryId })
  if (!book) {
    // add from OpenLibrary API if not found locally
    const volume = await axios.get(
      `https://openlibrary.org/works/${openLibraryId}.json`
    )
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
      openLibraryId,
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
}

module.exports.removeCopy = async (req, res, next) => {
  const { id, bookId } = req.params

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  // only library owner can remove copies
  // TODO: refactor to middleware
  const { user } = req
  if (user.id !== library.owner.id)
    return next(createError(403, 'You are not the owner of this library'))

  const book = await BookCopy.findById(bookId)
  if (!book) return next(createError(404, 'Book not found'))

  try {
    await library.removeBookCopy(book)
    return res.status(204).send()
  } catch (err) {
    return next(createError(500, err.message))
  }
}

module.exports.joinLibrary = async (req, res, next) => {
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
}

module.exports.leaveLibrary = async (req, res, next) => {
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
}

module.exports.getAllMembers = async (req, res, next) => {
  const { id } = req.params

  const library = await Library.findById(id)
  if (!library) return next(createError(404, 'Library not found'))

  try {
    const { members } = library
    return res.send(members)
  } catch (err) {
    return next(createError(500, err.message))
  }
}

module.exports.updateCopy = async (req, res, next) => {
  const { copyId } = req.params
  const { action } = req.body
  const { user } = req

  const bookCopy = await BookCopy.findById(copyId)

  if (!bookCopy) {
    return next(createError(404, 'Book copy not found'))
  }

  try {
    switch (action) {
      case 'borrow':
        await user.borrowBook(bookCopy)
        return res.send(bookCopy)
      case 'return':
        await user.returnBook(bookCopy)
        return res.send(bookCopy)
      case 'extend':
        await bookCopy.extend()
        return res.send(bookCopy)
      case 'lose':
        await bookCopy.lose()
        return res.send(bookCopy)
      default:
        return next(createError(400, 'Invalid action'))
    }
  } catch (err) {
    console.error(err)
    return next(
      createError(
        500,
        'An error occurred while updating the book copy. Please try again later.'
      )
    )
  }
}

module.exports.updateLibrary = async (req, res, next) => {
  try {
    const libraryId = req.params.id
    const { name, location } = req.body

    const library = await Library.findById(libraryId)
    if (!library) next(createError(404, 'Library not found'))

    // only library owner can edit library
    const { user } = req
    if (user.id !== library.owner.id)
      return next(createError(403, 'You are not the owner of this library'))

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
  } catch (err) {
    console.error(err)
    return next(createError(500, err.message))
  }
}

module.exports.uploadImage = async (req, res, next) => {
  try {
    const myFile = req.file
    const { publicUrl, name } = await uploadImage(myFile)
    return res.status(200).json({
      message: 'Upload was successful',
      data: {
        publicUrl,
        name,
      },
    })
  } catch (error) {
    return next(createError(500, error.message))
  }
}

module.exports.deleteImage = async (req, res, next) => {
  const { filename } = req.params
  try {
    await deleteImage(filename)
    return res.status(200).json({
      message: 'File deleted successfully',
    })
  } catch (error) {
    return next(createError(500, error.message))
  }
}

module.exports.generateEnhancedDescription = async (req, res) => {
  const { description } = req.body
  if (!description) {
    return res.status(400).json({
      message: 'Please provide a description',
    })
  }
  const enhancedDescription = await descriptionEnhancer(description)
  return res.send(enhancedDescription)
}
