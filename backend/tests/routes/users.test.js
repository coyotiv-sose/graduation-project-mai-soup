const request = require('supertest')
const chance = require('chance').Chance()
const User = require('../../src/models/user')
const app = require('../../src/app')

it('should sign up a new user', async () => {
  const user = {
    username: 'maijs',
    email: 'mai@example.com',
  }
  const response = await request(app).post('/users').send(user)

  expect(response.status).toBe(201)
  expect(response.body).toMatchObject(user)
})

it('should not sign up a new user with an existing username', async () => {
  const user = {
    username: 'abc',
    email: 'abc@example.com',
  }
  await request(app).post('/users').send(user)

  const user2 = {
    username: 'abc',
    email: 'def@example.com',
  }

  const response = await request(app).post('/users').send(user2)
  expect(response.status).toBe(409)
})

it('should not sign up a new user with an existing email', async () => {
  const user = {
    username: 'xyz',
    email: 'xyz@example.com',
  }
  await request(app).post('/users').send(user)

  const user2 = {
    username: 'uvw',
    email: 'xyz@example.com',
  }

  const response = await request(app).post('/users').send(user2)
  expect(response.status).toBe(409)
})

it('should not sign up a new user without a username', async () => {
  const user = {
    email: chance.email(),
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should not sign up a new user without an email', async () => {
  const user = {
    username: chance.word(),
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should not sign up a new user with an empty username', async () => {
  const user = {
    username: '',
    email: chance.email(),
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should not sign up a new user with an empty email', async () => {
  const user = {
    username: chance.word(),
    email: '',
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should get all users', async () => {
  const user = await User.create({
    username: 'beeper',
    email: 'beepboop@gmail.com',
  })
  const response = await request(app).get('/users?json=true')

  expect(response.status).toBe(200)
  expect(response.body).toContainEqual(
    expect.objectContaining({
      username: user.username,
      email: user.email,
    })
  )
})

it('should handle server errors when getting all users', async () => {
  jest.spyOn(User, 'find').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response = await request(app).get('/users')
  expect(response.status).toBe(500)
})

it('should get a user by username', async () => {
  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const response = await request(app).get(`/users/${user.username}`)
  expect(response.status).toBe(200)
  expect(response.body).toMatchObject({
    username: user.username,
    email: user.email,
  })
})

// restore the original behavior of User.find
afterEach(() => {
  jest.restoreAllMocks()
})
