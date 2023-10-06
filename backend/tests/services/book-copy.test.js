const chance = require('chance').Chance()
const { addDays, differenceInCalendarDays } = require('date-fns')
const BookInfo = require('../../src/models/book-info')
const User = require('../../src/models/user')
const getValidPassword = require('../generateValidPassword')
// the require fixes mongo connection not yet being established
// when model operations are called
require('../../src/app')

const getBookInfo = async () => {
  const fields = {
    title: chance.sentence(),
    authors: [chance.name()],
    openLibraryId: chance.guid(),
    imageUrl: chance.url(),
  }

  const info = BookInfo.create(fields)
  return info
}

const getTestUser = async () => {
  const email = chance.email()
  const username = chance.word({ length: 5 })
  const password = getValidPassword()
  const user = await User.register({ username, email }, password)
  return user
}

const getLibrary = async () => {
  const user = await getTestUser()

  const libraryInfo = {
    name: chance.word({ length: 10 }),
    location: chance.word(),
    latitude: chance.latitude(),
    longitude: chance.longitude(),
  }

  const library = await user.createLibrary(libraryInfo)
  return library
}

it('should be available by default and have bookinfo and library set', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)

  expect(copy.status).toBe('available')
  expect(copy.borrower).toBeUndefined()
  expect(copy.returnDate).toBeUndefined()
  expect(copy.library).toMatchObject({
    _id: library._id,
  })
  expect(copy.bookInfo).toMatchObject({
    _id: bookInfo._id,
  })
})

it('should be able to be borrowed by a user if available', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)
  const user = await getTestUser()

  await copy.borrow(user)

  expect(copy.status).toBe('borrowed')
  expect(copy.borrower).toMatchObject({
    _id: user._id,
  })
  // return date should be 14 days in the future, time irrelevant
  expect(differenceInCalendarDays(copy.returnDate, new Date())).toBe(14)
})

it('should not be able to be borrowed by a user if already borrowed', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)
  const user = await getTestUser()

  await copy.borrow(user)

  let error
  try {
    await copy.borrow(user)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not available')
})

it('should be able to be returned if borrowed', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)
  const user = await getTestUser()

  await copy.borrow(user)
  await copy.return()

  expect(copy.status).toBe('available')
  expect(copy.borrower).toBeNull()
  expect(copy.returnDate).toBeNull()
})

it('should throw if trying to return a book that is available', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)

  let error
  try {
    await copy.return()
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not borrowed')
})

it('should throw if trying to extend a loan due in more than 7 days', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)
  const user = await getTestUser()

  await copy.borrow(user)
  copy.returnDate = addDays(new Date(), 8)
  await copy.save()

  let error
  try {
    await copy.extend()
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('return date is too far in the future')
})

it('should extend a loan due in less than 7 days by 7 days', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)
  const user = await getTestUser()

  await copy.borrow(user)
  copy.returnDate = addDays(new Date(), 5)
  await copy.save()

  await copy.extend()

  expect(differenceInCalendarDays(copy.returnDate, new Date())).toBe(5 + 7)
  expect(copy.status).toBe('borrowed')
  expect(copy.borrower).toMatchObject({
    _id: user._id,
  })
})

it('should throw if trying to extend an available copy', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)

  let error
  try {
    await copy.extend()
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not borrowed')
})

it('should be able to be marked as lost', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)

  await copy.lose()

  expect(copy.status).toBe('lost')
  expect(copy.borrower).toBeNull()
  expect(copy.returnDate).toBeNull()
  expect(copy.library).toMatchObject({
    _id: library._id,
  })
  expect(copy.bookInfo).toMatchObject({
    _id: bookInfo._id,
  })
})

it('should throw if trying to borrow a lost copy', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)
  const user = await getTestUser()

  copy.status = 'lost'
  await copy.save()

  let error
  try {
    await copy.borrow(user)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not available')
})

it('should throw if trying to return a lost copy', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)

  copy.status = 'lost'
  await copy.save()

  let error
  try {
    await copy.return()
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not borrowed')
})

it('should throw if trying to extend a lost copy', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookInfo()
  const copy = await library.addBook(bookInfo)

  copy.status = 'lost'
  await copy.save()

  let error
  try {
    await copy.extend()
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not borrowed')
})
