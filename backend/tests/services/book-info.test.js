const chance = require('chance').Chance()
const BookInfo = require('../../src/models/book-info')
const User = require('../../src/models/user')
const getValidPassword = require('../generateValidPassword')
// the require fixes mongo connection not yet being established
// when model operations are called
require('../../src/app')

const getValidFields = () => ({
  title: chance.sentence(),
  authors: [chance.name()],
  openLibraryId: chance.guid(),
  imageUrl: chance.url(),
})

const getTestUserData = () => ({
  email: chance.email(),
  username: chance.word({ length: 5 }),
  password: getValidPassword(),
})

const getLibrary = async () => {
  const { username, email, password } = getTestUserData()
  const user = await User.register({ username, email }, password)

  const libraryInfo = {
    name: chance.word({ length: 10 }),
    location: chance.word(),
    latitude: chance.latitude(),
    longitude: chance.longitude(),
  }

  const library = await user.createLibrary(libraryInfo)
  return library
}

it('can create a new book info', async () => {
  const fields = getValidFields()
  let error
  try {
    await BookInfo.create(fields)
  } catch (err) {
    error = err
  }
  expect(error).toBeUndefined()

  const bookInfo = await BookInfo.findOne({
    openLibraryId: fields.openLibraryId,
  })

  expect(bookInfo).toMatchObject(fields)
})

it('should not allow creating a book info without a title', async () => {
  const { authors, openLibraryId, imageUrl } = getValidFields()
  let error
  try {
    await BookInfo.create({ authors, openLibraryId, imageUrl })
  } catch (err) {
    error = err
  }
  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.title).toBeDefined()
  expect(error.errors.title.kind).toBe('required')
})

it('should not allow creating a book info without authors', async () => {
  const { title, openLibraryId, imageUrl } = getValidFields()
  let error
  try {
    await BookInfo.create({ title, openLibraryId, imageUrl })
  } catch (err) {
    error = err
  }
  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.authors).toBeDefined()
  expect(error.errors.authors.kind).toBe('user defined')
  expect(error.errors.authors.message).toBe('At least one author is required.')
})

it('should not allow creating a book info without an open library id', async () => {
  const { title, authors, imageUrl } = getValidFields()

  let error
  try {
    await BookInfo.create({ title, authors, imageUrl })
  } catch (err) {
    error = err
  }
  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.openLibraryId).toBeDefined()
  expect(error.errors.openLibraryId.kind).toBe('required')
})

it('should allow creating a book info with only the required fields', async () => {
  const { title, authors, openLibraryId } = getValidFields()
  let error
  try {
    await BookInfo.create({ title, authors, openLibraryId })
  } catch (err) {
    error = err
  }
  expect(error).toBeUndefined()

  const bookInfo = await BookInfo.findOne({
    openLibraryId,
  })

  expect(bookInfo).toMatchObject({ title, authors, openLibraryId })
})

it('should ignore fields that do not exist in the schema', async () => {
  const { title, authors, openLibraryId } = getValidFields()
  let error
  try {
    await BookInfo.create({ title, authors, openLibraryId, foo: 'bar' })
  } catch (err) {
    error = err
  }
  expect(error).toBeUndefined()

  const bookInfo = await BookInfo.findOne({
    openLibraryId,
  })

  expect(bookInfo).toMatchObject({ title, authors, openLibraryId })
  expect(bookInfo.foo).toBeUndefined()
})

it('should add a new library to the foundIn list', async () => {
  const info = await BookInfo.create(getValidFields())
  const library = await getLibrary()

  await info.addToLibrary(library)

  expect(info.librariesFoundIn.length).toBe(1)
  expect(info.librariesFoundIn).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: library._id,
      }),
    ])
  )
})

it('should not add a duplicate library to the foundIn list', async () => {
  const info = await BookInfo.create(getValidFields())
  const library = await getLibrary()

  await info.addToLibrary(library)
  await info.addToLibrary(library)

  expect(info.librariesFoundIn.length).toBe(1)
  expect(info.librariesFoundIn).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: library._id,
      }),
    ])
  )
})

it('should remove a library from the foundIn list', async () => {
  const info = await BookInfo.create(getValidFields())
  const library = await getLibrary()

  await info.addToLibrary(library)
  await info.removeFromLibrary(library)

  expect(info.librariesFoundIn.length).toBe(0)
})

it('should only remove the library specified from the foundIn list, if several entries exist', async () => {
  const info = await BookInfo.create(getValidFields())
  const library1 = await getLibrary()
  const library2 = await getLibrary()
  const library3 = await getLibrary()
  const library4 = await getLibrary()

  await info.addToLibrary(library1)
  await info.addToLibrary(library2)
  await info.addToLibrary(library3)
  await info.addToLibrary(library4)
  await info.removeFromLibrary(library2)

  expect(info.librariesFoundIn.length).toBe(3)
  expect(info.librariesFoundIn).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: library1._id,
      }),
      expect.objectContaining({
        _id: library3._id,
      }),
      expect.objectContaining({
        _id: library4._id,
      }),
    ])
  )
})

it('should throw error when attempting to remove from a library the book is not in', async () => {
  const info = await BookInfo.create(getValidFields())
  const library = await getLibrary()

  let error
  try {
    await info.removeFromLibrary(library)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not in this library')
})
