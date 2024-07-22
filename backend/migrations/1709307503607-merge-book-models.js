'use strict'

const mongoose = require('mongoose')
const BookInfo = require('../src/models/book-info')
const BookCopy = require('../src/models/book-copy')
const Book = require('../src/models/book')
const User = require('../src/models/user')
const Library = require('../src/models/library')

module.exports.up = async next => {
  try {
    console.log('Starting migration...')

    // MongoDB connection URI
    const mongoURI = process.env.MONGO_URI

    // Define connection options with custom timeout settings
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
    }

    // Create Mongoose connection
    await mongoose.connect(mongoURI, options)
    console.log('MongoDB connected')

    const users3 = await User.find()
    console.log('users BEGINNING', users3)

    // Step 1: Fetch all BookCopies and BookInfos
    const bookCopies = await BookCopy.find().populate(
      'bookInfo library borrower'
    )

    if (bookCopies.length === 0) {
      console.log(
        'No BookCopies found. Dropping both BookInfo and BookCopy collections and skipping the rest of migration logic.'
      )
      await BookCopy.collection.drop()
      await BookInfo.collection.drop()
      return next()
    }

    const bookInfos = await BookInfo.find()
    console.log('Number of BookInfos before migration:', bookInfos.length)

    const users1 = await User.find().populate('loans')
    console.log('users1', users1)

    // Step 2: Transform BookCopies into Books
    for (const bookCopy of bookCopies) {
      const book = new Book({
        title: bookCopy.bookInfo.title,
        authors: bookCopy.bookInfo.authors.join(', '),
        status: bookCopy.status,
        borrower: bookCopy.borrower,
        returnDate: bookCopy.returnDate,
        library: bookCopy.library,
      })
      await book.save()
    }

    // unset loans field for all users
    await User.updateMany({}, { $unset: { loans: 1 } })
    // unser books field for all libraries
    await Library.updateMany({}, { $unset: { books: 1 } })

    // Step 3: Update Users' loans and Libraries' books
    const books = await Book.find().populate('borrower library')
    console.log('books', books)
    for (const book of books) {
      if (book.borrower) {
        const user = await User.findById(book.borrower)
        if (user) {
          user.loans.push(book._id)
          await user.save()
        }
      }
      const library = await Library.findById(book.library)
      if (library) {
        library.books.push(book._id)
        await library.save()
      }
    }

    // Cleanup: Drop BookCopy and BookInfo collections
    await BookCopy.collection.drop()
    await BookInfo.collection.drop()

    console.log('Migration completed successfully.')

    // Close Mongoose connection after migration
    await mongoose.connection.close()
    console.log('MongoDB connection closed')

    next()
  } catch (error) {
    console.error('Error during migration:', error)
    next(error)
  }
}

module.exports.down = function (next) {
  next()
}
