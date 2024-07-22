'use strict'

const mongoose = require('mongoose')
const BookInfo = require('../src/models/book-info')
const BookCopy = require('../src/models/book-copy')
const User = require('../src/models/user')
const Library = require('../src/models/library')
const {
  createTestUser,
  createTestLibrary,
  createTestBookCopy,
  createTestBookInfo,
} = require('./test-data-creators')

const mongoUri = process.env.MONGO_URI

const moonBookParams = {
  title: 'Moon',
  authors: ['Person One', 'Another Person'],
  returnDate: new Date('2024-08-23'),
}

const starBookParams = {
  title: 'Star',
  authors: ['Another Person', 'Person Two'],
  returnDate: new Date('2024-07-14'),
}

async function addTestData() {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  await mongoose.connection.dropDatabase()

  // Insert initial data into the database using test data creators
  const userA = await createTestUser({ username: 'Alice' })
  const userB = await createTestUser({ username: 'Bob' })
  const userC = await createTestUser({ username: 'Charlie' })

  const libraryOne = await createTestLibrary({
    name: 'Library One',
    owner: userA,
  })
  const libraryTwo = await createTestLibrary({
    name: 'Library Two',
    owner: userC,
  })

  await userB.joinLibrary(libraryOne)
  await userB.joinLibrary(libraryTwo)
  await userC.joinLibrary(libraryOne)

  const moonBookInfo = await createTestBookInfo({
    title: moonBookParams.title,
    authors: moonBookParams.authors,
  })
  const starBookInfo = await createTestBookInfo({
    title: starBookParams.title,
    authors: starBookParams.authors,
  })

  await createTestBookCopy({
    bookInfo: moonBookInfo,
    library: libraryOne,
  })

  await createTestBookCopy({
    bookInfo: moonBookInfo,
    library: libraryTwo,
    status: 'borrowed',
    borrower: userB,
    returnDate: moonBookParams.returnDate,
  })

  await createTestBookCopy({
    bookInfo: starBookInfo,
    library: libraryTwo,
    status: 'borrowed',
    borrower: userB,
    returnDate: starBookParams.returnDate,
  })

  // Log initial state before migration
  console.log('Initial state before migration:')
  console.log("Bob's loans before migration:", userB.loans)
  console.log('Library One books before migration:')
  const libraryOneBooks = await BookCopy.find({ library: libraryOne })
  console.log(libraryOneBooks)
  console.log('Library Two books before migration:')
  const libraryTwoBooks = await BookCopy.find({ library: libraryTwo })
  console.log(libraryTwoBooks)

  await mongoose.connection.close()
}

addTestData().catch(err => {
  console.error(err)
  mongoose.connection.close()
})
