const chance = require('chance').Chance()
const passwordGen = require('generate-password')
const getValidPassword = require('../generateValidPassword')
const User = require('../../src/models/user')
const Library = require('../../src/models/library')
// the require fixes mongo connection not yet being established
// when model operations are called
require('../../src/app')

const testUserData = () => ({
  email: chance.email(),
  username: chance.word({ length: 5 }),
  password: getValidPassword(),
})

it('should create and save a new user', async () => {
  const { username, email, password } = testUserData()
  const user = await User.register({ username, email }, password)

  expect(user).not.toBeNull()
  expect(user.email).toBe(email)
  expect(user.username).toBe(username)
  expect(user.hash).toBeDefined()
  expect(user.salt).toBeDefined()
})

it('should return undefined for fields passed in that are not in the schema', async () => {
  const { username, email, password } = testUserData()
  const user = await User.register({ username, email, foo: 'bar' }, password)

  expect(user).not.toBeNull()
  expect(user.foo).toBeUndefined()
  expect(user.email).toBe(email)
  expect(user.username).toBe(username)
})

it('should return an error if username is not provided on user creation', async () => {
  const { email, password } = testUserData()

  let error
  try {
    await User.register({ email }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('MissingUsernameError')
  expect(error.message).toBe('No username was given')
})

it('should return an error if email is not provided on user creation', async () => {
  const { username, password } = testUserData()

  let error
  try {
    await User.register({ username }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.email).toBeDefined()
  expect(error.errors.email.kind).toBe('required')
})

it('should return an error if password is not provided on user creation', async () => {
  const { username, email } = testUserData()

  let error
  try {
    await User.register({ username, email })
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('MissingPasswordError')
  expect(error.message).toBe('No password was given')
})

// TODO: fails, fix validation
// it('should throw an error if email is not valid during registration', async () => {
//   const { username, password } = testUserData()
//   const email = chance.word()

//   let error
//   try {
//     await User.register({ username, email }, password)
//   } catch (err) {
//     error = err
//   }

//   expect(error).toBeDefined()
//   expect(error.name).toBe('ValidationError')
//   expect(error.errors.email).toBeDefined()
// })

it('should throw an error if username is already taken during registration', async () => {
  const { email, password } = testUserData()
  const username = chance.word({ length: 5 })

  await User.register({ username, email }, password)

  let error
  try {
    await User.register({ username, email }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('UserExistsError')
  expect(error.message).toBe(
    'A user with the given username is already registered'
  )
})

it('should throw an error if email is already taken during registration', async () => {
  const { username, password } = testUserData()
  const email = chance.email()

  await User.register({ username, email }, password)

  let error
  try {
    await User.register({ username, email }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('UserExistsError')
  expect(error.message).toBe(
    'A user with the given username is already registered'
  )
})

it('should throw an error if username is too short during registration', async () => {
  const { email, password } = testUserData()
  const username = chance.word({ length: 2 })

  let error
  try {
    await User.register({ username, email }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.username).toBeDefined()
  expect(error.errors.username.kind).toBe('minlength')
})

it('should throw an error if username is too long during registration', async () => {
  const { email, password } = testUserData()
  const username = chance.word({ length: 25 })

  let error
  try {
    await User.register({ username, email }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.username).toBeDefined()
  expect(error.errors.username.kind).toBe('maxlength')
})

it('should allow registration with username with every type of valid character', async () => {
  const { email, password } = testUserData()
  // username can have alphanumeric characters of both cases, underscores, dashes
  const username =
    // eslint-disable-next-line prefer-template
    chance.word({ length: 3 }) +
    '_' +
    chance.word({ length: 3 }).toUpperCase() +
    '-' +
    chance.word({ length: 3 }) +
    chance.integer({ min: 0, max: 999 })

  const user = await User.register({ username, email }, password)

  expect(user).not.toBeNull()
  expect(user.email).toBe(email)
  expect(user.username).toBe(username)
})

it('should throw an error if username has invalid characters during registration', async () => {
  const { email, password } = testUserData()

  // not exhaustive
  const invalidCharacterPool = [
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
  ]

  invalidCharacterPool.forEach(async invalidCharacter => {
    const username =
      chance.word({ length: 3 }) + invalidCharacter + chance.word({ length: 3 })

    let error
    try {
      await User.register({ username, email }, password)
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.name).toBe('ValidationError')
    expect(error.errors.username).toBeDefined()
    expect(error.errors.username.kind).toBe('regexp')
  })
})

it('should throw an error if password is too short when registering', async () => {
  const { username, email } = testUserData()
  const password = chance.word({ length: 7 })

  let error
  try {
    await User.register({ username, email }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error).toContain('min')
})

it('should throw an error if password is too long when registering', async () => {
  const { username, email } = testUserData()
  const password = chance.word({ length: 65 })

  let error
  try {
    await User.register({ username, email }, password)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error).toContain('max')
})

it('should throw error if password does not have all required types of symbols', async () => {
  const { username, email } = testUserData()

  const passNoNumbers = passwordGen.generate({
    length: 48,
    uppercase: true,
    lowercase: true,
    numbers: false,
    symbols: true,
    strict: true,
  })

  let error
  // TODO: refactor to be less repetitive
  try {
    await User.register({ username, email }, passNoNumbers)
  } catch (err) {
    error = err
    expect(err).toContain('digits')
  }

  expect(error).toBeDefined()
  error = undefined

  const passNoUppercase = passwordGen.generate({
    length: 48,
    uppercase: false,
    lowercase: true,
    numbers: true,
    symbols: true,
    strict: true,
  })

  try {
    await User.register({ username, email }, passNoUppercase)
  } catch (err) {
    error = err
    expect(err).toContain('uppercase')
  }

  expect(error).toBeDefined()
  error = undefined

  const passNoLowerCase = passwordGen.generate({
    length: 48,
    uppercase: true,
    lowercase: false,
    numbers: true,
    symbols: true,
    strict: true,
  })

  try {
    await User.register({ username, email }, passNoLowerCase)
  } catch (err) {
    error = err
    expect(err).toContain('lowercase')
  }

  expect(error).toBeDefined()
  error = undefined

  const passNoSymbols = passwordGen.generate({
    length: 48,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    strict: true,
  })

  try {
    await User.register({ username, email }, passNoSymbols)
  } catch (err) {
    error = err
    expect(err).toContain('symbols')
  }

  expect(error).toBeDefined()
})

it('should successfully authenticate a registered user with username and password', async () => {
  const { username, email, password } = testUserData()

  await User.register({ username, email }, password)

  const { user, error } = await User.authenticate()(username, password)

  expect(error).not.toBeDefined()
  expect(user).toBeDefined()
  expect(user.username).toBe(username)
  expect(user.email).toBe(email)
})

it('should successfully authenticate a registered user with email and password', async () => {
  const { username, email, password } = testUserData()

  await User.register({ username, email }, password)

  const { user, error } = await User.authenticate()(email, password)

  expect(error).not.toBeDefined()
  expect(user).toBeDefined()
  expect(user.username).toBe(username)
  expect(user.email).toBe(email)
})

it('should return error when trying to authenticate with unregistered username', async () => {
  const { username, password } = testUserData()

  const { user, error } = await User.authenticate()(username, password)

  expect(user).toBe(false)
  expect(error.name).toBe('IncorrectUsernameError')
  expect(error.message).toBe('Password or username is incorrect')
})

it('should return error when trying to authenticate with unregistered email', async () => {
  const { email, password } = testUserData()

  const { user, error } = await User.authenticate()(email, password)

  expect(user).toBe(false)
  expect(error.name).toBe('IncorrectUsernameError')
  expect(error.message).toBe('Password or username is incorrect')
})

it('should return error when trying to authenticate with valid username but wrong password', async () => {
  const { username, email, password } = testUserData()

  await User.register({ username, email }, password)

  const { user, error } = await User.authenticate()(
    username,
    getValidPassword()
  )

  expect(user).toBe(false)
  expect(error.name).toBe('IncorrectPasswordError')
  expect(error.message).toBe('Password or username is incorrect')
})

it('should return error when trying to authenticate with valid email but wrong password', async () => {
  const { username, email, password } = testUserData()

  await User.register({ username, email }, password)

  const { user, error } = await User.authenticate()(email, getValidPassword())

  expect(user).toBe(false)
  expect(error.name).toBe('IncorrectPasswordError')
  expect(error.message).toBe('Password or username is incorrect')
})

it('should return error when trying to authenticate with valid username but no password', async () => {
  const { username, email, password } = testUserData()

  await User.register({ username, email }, password)

  const { user, error } = await User.authenticate()(username, '')

  expect(user).toBe(false)
  expect(error.name).toBe('IncorrectPasswordError')
  expect(error.message).toBe('Password or username is incorrect')
})

it('should return error when trying to authenticate with no username but someones password', async () => {
  const { username, email, password } = testUserData()

  await User.register({ username, email }, password)

  const { user, error } = await User.authenticate()('', password)

  expect(user).toBe(false)
  expect(error.name).toBe('IncorrectUsernameError')
  expect(error.message).toBe('Password or username is incorrect')
})

it('should find a registered user by username', async () => {
  const { username, email, password } = testUserData()

  await User.register({ username, email }, password)

  const user = await User.findOne({ username })

  expect(user).toBeDefined()
  expect(user.username).toBe(username)
  expect(user.email).toBe(email)
})

// // TODO: rewrite when email validation implemented
// it('should throw error when updating user with invalid email', async () => {
//   const { username, email, password } = testUserData()

//   const user = await User.register({ username, email }, password)

//   const invalidEmail = 'asdfghjkl;'
//   user.email = invalidEmail

//   let error
// try {
//   await user.save()
// } catch (err) {
//   error = err
// }

// expect(error).toBeDefined()
// expect(error.name).toBe('ValidationError')
// expect(error.errors.email).toBeDefined()
// })

it('throws error when updating user with invalid username', async () => {
  const { username, email, password } = testUserData()

  const user = await User.register({ username, email }, password)

  const invalidUsername = 'a;' // too short and invalid character
  user.username = invalidUsername

  let error
  try {
    await user.save()
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.username).toBeDefined()
})

it('returns error when updating user with invalid password', async () => {
  const { username, email, password } = testUserData()

  const user = await User.register({ username, email }, password)

  const invalidPassword = '<PASSWORD>' // no digits, no lowercase letters

  let error
  try {
    await user.setPassword(invalidPassword)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error).toContain('lowercase')
  expect(error).toContain('digits')
})

it('successfully creates a new library with valid fields', async () => {
  const { username, email, password } = testUserData()
  const user = await User.register({ username, email }, password)

  const libraryInfo = {
    name: chance.word({ length: 10 }),
    location: chance.word(),
  }

  await user.createLibrary(libraryInfo)

  const library = await Library.findOne({
    name: libraryInfo.name,
    owner: user._id,
  })

  expect(library).toBeDefined()
  expect(library.location).toBe(libraryInfo.location)
})

it('throws error when creating a new library with invalid fields', async () => {
  const { username, email, password } = testUserData()
  const user = await User.register({ username, email }, password)

  const invalidLibraryInfo = {
    name: '',
    location: chance.word(),
    coordinates: [],
  }

  let error
  try {
    await user.createLibrary(invalidLibraryInfo)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.name).toBe('ValidationError')
  expect(error.errors.name).toBeDefined()
})

// TODO: implement in userservice
// - successful owned library update with valid fields
// - failing owned library update with invalid fields
// - failing update of a library the user does not own

it('successful joining of an existing library', async () => {
  const { username, email, password } = testUserData()
  const owner = await User.register({ username, email }, password)

  const library = await owner.createLibrary({
    name: chance.word({ length: 10 }),
    location: chance.word(),
    coordinates: [chance.longitude(), chance.latitude()],
  })

  const {
    username: username2,
    email: email2,
    password: password2,
  } = testUserData()
  const user = await User.register(
    { username: username2, email: email2 },
    password2
  )

  await user.joinLibrary(library)

  expect(library.members.length).toBe(2)
  expect(library.members).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: user._id,
        username: username2,
        email: email2,
      }),
      expect.objectContaining({
        _id: owner._id,
        username,
        email,
      }),
    ])
  )

  expect(user.memberships).toBeDefined()
  expect(user.memberships.length).toBe(1)
  expect(user.memberships).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: library._id,
        name: library.name,
        location: library.location,
      }),
    ])
  )
})

it('throws error when trying to join a library the user is already a member of', async () => {
  const { username, email, password } = testUserData()
  const owner = await User.register({ username, email }, password)
  const library = await owner.createLibrary({
    name: chance.word({ length: 10 }),
    location: chance.word(),
    coordinates: [chance.longitude(), chance.latitude()],
  })

  const {
    username: username2,
    email: email2,
    password: password2,
  } = testUserData()

  const user = await User.register(
    { username: username2, email: email2 },
    password2
  )

  await user.joinLibrary(library)

  let error
  try {
    await user.joinLibrary(library)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('user is already a member of this library')
})

// - successful leaving of an existing library (user is a member)
it('can leave a library the user is a member of', async () => {
  const { username, email, password } = testUserData()
  const owner = await User.register({ username, email }, password)
  const library = await owner.createLibrary({
    name: chance.word({ length: 10 }),
    location: chance.word(),
    coordinates: [chance.longitude(), chance.latitude()],
  })

  const {
    username: username2,
    email: email2,
    password: password2,
  } = testUserData()
  const user = await User.register(
    { username: username2, email: email2 },
    password2
  )

  await user.joinLibrary(library)
  await user.leaveLibrary(library)

  expect(library.members.length).toBe(1)
  // owner should still be a member
  expect(library.members).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: owner._id,
        username,
        email,
      }),
    ])
  )
  // user who left should no longer be a member
  expect(library.members).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: user._id,
        username: username2,
        email: email2,
      }),
    ])
  )
})

it('throws error when trying to leave a library the user is not a member of', async () => {
  const { username, email, password } = testUserData()
  const owner = await User.register({ username, email }, password)
  const library = await owner.createLibrary({
    name: chance.word({ length: 10 }),
    location: chance.word(),
    coordinates: [chance.longitude(), chance.latitude()],
  })

  const {
    username: username2,
    email: email2,
    password: password2,
  } = testUserData()
  const user = await User.register(
    { username: username2, email: email2 },
    password2
  )

  let error
  try {
    await user.leaveLibrary(library)
  } catch (err) {
    error = err
  }

  expect(error).toBeDefined()
  expect(error.message).toBe('user is not member of this library')
})

// TODO: finish these after testing libraries and book copies
// - if a book is available in a library the user is a member of, it can be borrowed
// - if a book is not available in a library the user is a member of, it cannot be borrowed
// - a book the user has borrowed can be returned
// - if the user has not borrowed a book, it cannot be returned
// - missing fields in borrowing a book
// - missing fields in returning a book
