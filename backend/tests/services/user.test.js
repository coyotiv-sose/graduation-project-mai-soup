const chance = require('chance').Chance()
const User = require('../../src/models/user')
const Library = require('../../src/models/library')
// the require fixes mongo connection not yet being established
// when model operations are called
// eslint-disable-next-line no-unused-vars
const app = require('../../src/app')

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
