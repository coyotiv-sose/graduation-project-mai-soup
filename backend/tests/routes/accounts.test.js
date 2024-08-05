const request = require('supertest')
const app = require('../../src/app')
const chance = require('chance').Chance()
const User = require('../../src/models/user')
const getValidPassword = require('../generateValidPassword')

const agent = request.agent(app)
const username = chance.word({ length: 10 })
const email = chance.email()
const password = getValidPassword()

describe('Accounts Routes', () => {
  afterAll(async () => {
    await User.deleteMany({})
  })

  describe('POST /accounts', () => {
    it('should sign up a user', async () => {
      const response = await agent.post('/accounts').send({
        username,
        email,
        password,
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        __v: expect.any(Number),
        _id: expect.any(String),
        dateCreated: expect.any(String),
        email,
        username,
        loans: expect.any(Array),
        memberships: expect.any(Array),
        ownedLibraries: expect.any(Array),
      })
    })

    it('should not sign up a user with an existing username', async () => {
      await User.create({
        username: 'existingUser',
        email: 'existing@example.com',
      })

      const response = await agent.post('/accounts').send({
        username: 'existingUser',
        email: chance.email(),
        password: getValidPassword(),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /accounts/session', () => {
    it('should sign in a user', async () => {
      const response = await agent
        .post('/accounts/session')
        .send({ username, password })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        username,
        email,
      })
    })
  })

  describe('GET /accounts/session', () => {
    it('should get the authenticated user', async () => {
      const response = await agent.get('/accounts/session')
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        username,
        email,
      })
    })
  })

  describe('DELETE /accounts/session', () => {
    it('should sign out a user', async () => {
      await agent.post('/accounts/session').send({ username, password })

      const response = await agent.delete('/accounts/session')
      expect(response.status).toBe(200)
    })

    it('should not sign out a user if not signed in', async () => {
      const response = await request(app).delete('/accounts/session')
      expect(response.status).toBe(401)
    })
  })
})
