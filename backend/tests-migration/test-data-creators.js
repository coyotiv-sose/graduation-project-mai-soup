const User = require('../src/models/user')
const BookInfo = require('../src/models/book-info')
const BookCopy = require('../src/models/book-copy')
const chance = require('chance').Chance()

const createTestUser = async ({
  username,
  memberships = [],
  ownedLibraries = [],
  loans = [],
}) => {
  const user = new User({
    username,
    memberships,
    ownedLibraries,
    loans,
    email: chance.email(),
  })

  await user.save()
  return user
}

const createTestLibrary = async ({ name, owner, books = [], members = [] }) => {
  const library = await owner.createLibrary({
    name,
    location: chance.address(),
  })

  return library
}

const createTestBookInfo = async ({ title, authors }) => {
  const bookInfo = new BookInfo({
    title,
    authors,
    openLibraryId: chance.guid(),
    imageUrl: chance.url(),
  })

  await bookInfo.save()
  return bookInfo
}

const createTestBookCopy = async ({
  bookInfo,
  library,
  status = 'available',
  borrower,
  returnDate,
}) => {
  const bookCopy = new BookCopy({
    bookInfo,
    library,
    status,
    borrower,
    returnDate,
  })

  await bookCopy.save()

  if (borrower) {
    borrower.loans.push(bookCopy)
    await borrower.save()
  }
  return bookCopy
}

module.exports = {
  createTestUser,
  createTestLibrary,
  createTestBookInfo,
  createTestBookCopy,
}
