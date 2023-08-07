const request = require('supertest')
const User = require('../../src/models/user')
const app = require('../../src/app')

it('should sign up a new user', async () => {
  const user = {
    username: 'maijs',
    email: 'mai@example.com',
  }
  const response = await request(app).post('/users').send(user)

  expect(response.status).toBe(200)
  expect(response.body).toMatchObject(user)
})
