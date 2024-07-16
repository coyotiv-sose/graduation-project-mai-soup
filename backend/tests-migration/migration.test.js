const { exec } = require('child_process')
const util = require('util')

const execPromise = util.promisify(exec)

const BookInfo = require('../src/models/book-info')
const BookCopy = require('../src/models/book-copy')
const Book = require('../src/models/book')
const User = require('../src/models/user')
const Library = require('../src/models/library')
const {
  createTestUser,
  createTestLibrary,
  createTestBookCopy,
  createTestBookInfo,
} = require('./test-data-creators')
const { title } = require('process')

let userA, userB, userC
let libraryOne, libraryTwo

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

describe('book model migration test', () => {
  beforeAll(async () => {
    // insert initial data into the database
    userA = await createTestUser({ username: 'Alice' })
    userB = await createTestUser({ username: 'Bob' })
    userC = await createTestUser({ username: 'Charlie' })

    libraryOne = await createTestLibrary({ name: 'Library One', owner: userA })
    libraryTwo = await createTestLibrary({ name: 'Library Two', owner: userC })

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

    // run migration script
    await execPromise('npx migrate up')
  })

  it('should migrate the database correctly', async () => {
    const documents = await User.find()

    expect(documents).toEqual([
      expect.objectContaining({
        name: 'Alice',
      }),
      expect.objectContaining({
        name: 'Bob',
      }),
    ])
  })
})
