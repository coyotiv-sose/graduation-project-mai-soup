const chance = require('chance').Chance()
const User = require('../../src/models/user')
// the require fixes mongo connection not yet being established
// when model operations are called
require('../../src/app')

const testUserData = () => ({
  email: chance.email(),
  username: chance.word(),
  password: chance.word(),
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

// TODO: general user creation/management tests
// ----- CREATION/AUTH -----
// - registration should fail with invalid email format
// - registration should fail with username already taken
// - registration should fail with email already taken
// - registration should fail with username too short
// - registration should fail with username too long
// - registration should fail with username with invalid characters
// - registration should fail with password too short
// - registration should fail with password too long
// - registration should fail with a password too weak
// - successful login with valid username and password
// - successful login with valid email and password
// - failing login with unregistered username
// - failing login with unregistered email
// - failing login with valid username but wrong password
// - failing login with valid email but wrong password
// - failing login with no password
// - failing login with no username
// - failing login with no email
// ----- USER RETRIEVAL -----
// - any registered user's (limited) info can be retrieved successfully
// - user's own info can be retrieved successfully
// --- not implemented functionality yet, but for future ---
// - user's own profile can be updated with valid information in various combinations
// - user's own profile cannot be updated with an invalid email
// - user can change their own password
// - user can delete their own account

// TODO: user functionality tests
// - successful library creation with valid fields
// - failing library creation with invalid fields
// - successful owned library update with valid fields
// - failing owned library update with invalid fields
// - failing update of a library the user does not own
// - successful joining of an existing library
// - failing joining a library that does not exist
// - failing joining a library the user is already a member of
// - successful leaving of an existing library (user is a member)
// - failing leaving of an existing library (user is not a member)
// - failing leaving a library that does not exist
// - if a book is available in a library the user is a member of, it can be borrowed
// - if a book is not available in a library the user is a member of, it cannot be borrowed
// - a book the user has borrowed can be returned
// - if the user has not borrowed a book, it cannot be returned
// - missing fields in borrowing a book
// - missing fields in returning a book
