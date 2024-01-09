const chance = require('chance').Chance()
const User = require('../../src/models/user')
const Library = require('../../src/models/library')
const Book = require('../../src/models/book')
const getValidPassword = require('../generateValidPassword')
// the require fixes mongo connection not yet being established
// when model operations are called
require('../../src/app')

const getValidFields = () => ({
  name: chance.word({ length: 10 }),
  location: chance.word(),
  geometry: {
    type: 'Point',
    coordinates: [chance.longitude(), chance.latitude()],
  },
})

const getTestUser = async () => {
  const username = chance.word({ length: 5 })
  const email = chance.email()
  const password = getValidPassword()

  const user = await User.register({ username, email }, password)

  return user
}

const getLibrary = async () => {
  const user = await getTestUser()
  const libraryInfo = getValidFields()

  const library = await user.createLibrary(libraryInfo)
  return library
}

const getBookFields = async () => ({
  title: chance.sentence(),
  authors: chance.name(),
})

it('can create a new library with valid fields', async () => {
  const fields = getValidFields()
  const owner = await getTestUser()
  fields.owner = owner

  let error
  let library
  try {
    library = await Library.create(fields)
  } catch (err) {
    error = err
  }

  expect(error).toBeUndefined()
  expect(library).toBeDefined()
  expect(library).toMatchObject({
    name: fields.name,
    location: fields.location,
    geometry: fields.geometry,
    owner: expect.objectContaining({
      username: owner.username,
      email: owner.email,
    }),
  })
})

// TODO: uncomment when ownership changing is implemented
// it('should successfully change ownership', async () => {
//   const library = await getLibrary()
//   const newOwner = await getTestUser()
//   const oldOwnerId = library.owner._id

//   let error
//   try {
//     library.owner = newOwner
//     await library.save()
//   } catch (err) {
//     error = err
//   }

//   const updatedLibrary = await Library.findById(library._id)
//   const updatedOwner = await User.findById(newOwner._id)
//   const updatedOldOwner = await User.findById(oldOwnerId)

//   expect(error).toBeUndefined()
//   expect(updatedLibrary.owner.username).toBe(newOwner.username)
//   expect(updatedLibrary.owner.email).toBe(newOwner.email)
//   expect(updatedOwner.ownedLibraries.length).toBe(1)
//   expect(updatedOwner.ownedLibraries).toEqual(
//     expect.arrayContaining([expect.objectContaining({ _id: library._id })])
//   )
//   expect(updatedOldOwner.ownedLibraries.length).toBe(0)
//   expect(updatedOldOwner.ownedLibraries).toEqual([])
// })

it('should successfully add a member', async () => {
  const library = await getLibrary()
  const user = await getTestUser()

  let error
  try {
    await library.addMember(user)
  } catch (err) {
    error = err
  }

  const updatedLibrary = await Library.findById(library._id)

  expect(error).toBeUndefined()
  expect(updatedLibrary.members.length).toBe(2)
  expect(updatedLibrary.members).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: user._id,
        username: user.username,
        email: user.email,
      }),
    ])
  )
})

it('should ignore attempt to add existing member', async () => {
  const library = await getLibrary()
  const user = await getTestUser()

  await library.addMember(user)

  let error
  try {
    await library.addMember(user)
  } catch (err) {
    error = err
  }

  const updatedLibrary = await Library.findById(library._id)

  expect(error).toBeUndefined()
  expect(updatedLibrary.members.length).toBe(2)
  expect(updatedLibrary.members).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: user._id,
        username: user.username,
        email: user.email,
      }),
    ])
  )
})

it('should successfully remove a member', async () => {
  const library = await getLibrary()
  const user = await getTestUser()

  await library.addMember(user)

  let error
  try {
    await library.removeMember(user)
  } catch (err) {
    error = err
  }

  const updatedLibrary = await Library.findById(library._id)

  expect(error).toBeUndefined()
  expect(updatedLibrary.members.length).toBe(1)
  expect(updatedLibrary.members).toEqual(
    expect.arrayContaining([
      expect.not.objectContaining({
        _id: user._id,
        username: user.username,
        email: user.email,
      }),
    ])
  )
})

it('should throw error when trying to remove a non-member', async () => {
  const library = await getLibrary()
  const user = await getTestUser()

  let error
  try {
    await library.removeMember(user)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('user is not a member of this library')
})

it('should successfully add a book', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookFields()

  let error
  try {
    await library.addBook(bookInfo)
  } catch (err) {
    error = err
  }

  const updatedLibrary = await Library.findById(library._id)
  expect(error).toBeUndefined()
  expect(updatedLibrary.books.length).toBe(1)
  expect(updatedLibrary.books).toEqual(
    expect.arrayContaining([expect.objectContaining(bookInfo)])
  )
})

it('should successfully remove a book', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookFields()

  const copy = await library.addBook(bookInfo)

  let error
  try {
    await library.removeBook(copy)
  } catch (err) {
    error = err
  }

  const updatedLibrary = await Library.findById(library._id)

  expect(error).toBeUndefined()
  expect(updatedLibrary.books.length).toBe(0)
  expect(updatedLibrary.books).toEqual([])
})

it('should throw if trying to remove a book that is not in the library', async () => {
  const library = await getLibrary()
  const bookInfo = await getBookFields()
  const copy = await library.addBook(bookInfo)
  const newLibrary = await getLibrary()

  let error
  try {
    await newLibrary.removeBook(copy)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('book is not in this library')
  expect(newLibrary.books.length).toBe(0)
  expect(newLibrary.books).toEqual([])

  // check that the book wasn't removed from the original library
  const updatedLibrary = await Library.findById(library._id)
  expect(updatedLibrary.books.length).toBe(1)
  expect(updatedLibrary.books).toEqual(
    expect.arrayContaining([expect.objectContaining(bookInfo)])
  )
})

// TODO: the functionality for this one's not fully implemented yet
// it('should not duplicate membership when changing to a new owner that is already a member', async () => {
//   let library = await getLibrary()
//   const newOwner = await getTestUser()
//   const oldOwnerId = library.owner._id

//   await newOwner.joinLibrary(library)
//   library = await Library.findById(library._id)

//   let error
//   try {
//     library.owner = newOwner
//     await library.save()
//   } catch (err) {
//     error = err
//   }

//   const updatedLibrary = await Library.findById(library._id)
//   const updatedOwner = await User.findById(newOwner._id)
//   const updatedOldOwner = await User.findById(oldOwnerId)

//   console.error('AWOOGA 4', updatedLibrary)
//   expect(error).toBeUndefined()
//   expect(updatedLibrary.owner.username).toBe(newOwner.username)
//   expect(updatedLibrary.owner.email).toBe(newOwner.email)
//   expect(updatedOwner.ownedLibraries.length).toBe(1)
//   expect(updatedOwner.ownedLibraries).toEqual(
//     expect.arrayContaining([expect.objectContaining({ _id: library._id })])
//   )
//   expect(updatedOldOwner.ownedLibraries.length).toBe(0)
//   expect(updatedOldOwner.ownedLibraries).toEqual([])
//   expect(updatedLibrary.members.length).toBe(2)
// })
