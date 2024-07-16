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
      // ALICE
      expect.objectContaining({
        username: 'Alice',
        loans: null,
        ownedLibraries: expect.arrayContaining([
          expect.objectContaining({
            name: 'Library One',
            owner: expect.objectContaining({ username: 'Alice' }),
            books: expect.arrayContaining([
              expect.objectContaining({
                title: moonBookParams.title,
                authors: moonBookParams.authors.join(', '),
                status: 'available',
                borrower: null,
                returnDate: null,
              }),
            ]),
          }),
        ]),
        memberships: expect.arrayContaining([
          expect.objectContaining({
            name: 'Library One',
          }),
        ]),
      }),
      // BOB
      expect.objectContaining({
        username: 'Bob',
        ownedLibraries: null,
        memberships: expect.arrayContaining([
          expect.objectContaining({
            name: 'Library One',
          }),
          expect.objectContaining({
            name: 'Library Two',
          }),
        ]),
        loans: expect.arrayContaining([
          expect.objectContaining({
            title: moonBookParams.title,
            authors: moonBookParams.authors.join(', '),
            library: expect.objectContaining({
              name: 'Library One',
            }),
            borrower: expect.objectContaining({ username: 'Bob' }),
            returnDate: moonBookParams.returnDate,
          }),
          expect.objectContaining({
            title: starBookParams.title,
            authors: starBookParams.authors.join(', '),
            library: expect.objectContaining({
              name: 'Library Two',
            }),
            borrower: expect.objectContaining({ username: 'Bob' }),
            returnDate: starBookParams.returnDate,
          }),
        ]),
      }),
      expect.objectContaining({
        username: 'Charlie',
        loans: null,
        ownedLibraries: expect.arrayContaining([
          expect.objectContaining({
            name: 'Library Two',
            owner: expect.objectContaining({ username: 'Charlie' }),
            books: expect.arrayContaining([
              expect.objectContaining({
                title: starBookParams.title,
                authors: starBookParams.authors.join(', '),
                status: 'borrowed',
                borrower: expect.objectContaining({ username: 'Bob' }),
                returnDate: starBookParams.returnDate,
              }),
            ]),
          }),
        ]),
      }),
    ])

    // none of the Book documents should have an openlibraryid or bookinfo field
    const bookDocuments = await Book.find()

    bookDocuments.forEach(book => {
      expect(book).toEqual(
        expect.objectContaining({
          openLibraryId: null,
          bookInfo: null,
        })
      )
    })
  })
})
