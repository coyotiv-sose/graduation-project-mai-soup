const chance = require('chance').Chance()
const Book = require('../../src/models/book')
const User = require('../../src/models/user')
const getValidPassword = require('../generateValidPassword')
// the require fixes mongo connection not yet being established
// when model operations are called
require('../../src/app')

const _getValidFields = () => ({
  title: chance.sentence(),
  authors: chance.name(),
})

const getTestBook = async () => {
  const fields = _getValidFields()

  const book = await Book.create(fields)

  return book
}

const getTestUser = async () => {
  const username = chance.word({ length: 5 })
  const email = chance.email()
  const password = getValidPassword()

  const user = await User.register({ username, email }, password)

  return user
}

it('should throw if attempting to borrow an unavailable book', async () => {
  const book = await getTestBook()
  const user = await getTestUser()

  book.status = 'borrowed'
  await book.save()

  let error
  try {
    await book.borrow(user)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not available')
})

it('should throw if attempting to return a book that is not borrowed', async () => {
  const book = await getTestBook()

  let error
  try {
    await book.return()
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not borrowed')
})
