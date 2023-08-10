const request = require('supertest')
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

it('should get all users', async () => {
  const user = await User.create({
    username: 'maijs',
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
