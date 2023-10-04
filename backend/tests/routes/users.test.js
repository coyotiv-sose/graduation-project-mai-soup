const request = require('supertest')
const chance = require('chance').Chance()
const User = require('../../src/models/user')
const app = require('../../src/app')

// restore the original behavior of mocked functions
afterEach(() => {
  jest.restoreAllMocks()
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
  })
})

it('should handle server errors when getting a user by username', async () => {
  jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const response = await request(app).get(`/users/${user.username}`)
  expect(response.status).toBe(500)
})

it('should return a 404 when getting a user by username that does not exist', async () => {
  jest.spyOn(User, 'findOne').mockImplementationOnce(() => null)

  const response = await request(app).get(
    `/users/${chance.word({ length: 5 })}`
  )
  expect(response.status).toBe(404)
})
