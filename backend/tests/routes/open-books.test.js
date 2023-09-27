const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')

const agent = request.agent(app)

beforeAll(async () => {
  const username = chance.word()
  const password = chance.word()

  await agent.post('/accounts').send({
    username,
    email: chance.email(),
    password,
  })

  await agent.post('/accounts/session').send({
    username,
    password,
  })
})

it('should return 400 on request with no query', async () => {
  const res = await agent.get('/open-books')
  expect(res.statusCode).toBe(400)
})

it('should return 401 on request with no auth', async () => {
  const res = await request(app).get('/open-books')
  expect(res.statusCode).toBe(401)
})

it('should return 404 on request with nonexistent book', async () => {
  const fakeTitle = chance.word().repeat(15)

  const res = await agent.get('/open-books').query({
    q: fakeTitle,
  })

  expect(res.statusCode).toBe(404)
})
