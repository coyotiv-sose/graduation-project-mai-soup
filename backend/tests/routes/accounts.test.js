const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')
const User = require('../../src/models/user')
const getValidPassword = require('../generateValidPassword')

const agent = request.agent(app)
const username = chance.word({ length: 10 })
const email = chance.email()
const password = getValidPassword()

describe('Accounts Routes', () => {
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
      expect(response.body.message).toBe('Registration failed')
    })

    it('should not sign up a user with an existing email', async () => {
      await User.create({
        username: 'existingEmailUser',
        email: 'existingemail@example.com',
      })

      const response = await agent.post('/accounts').send({
        username: chance.word({ length: 10 }),
        email: 'existingemail@example.com',
        password: getValidPassword(),
      })
      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Registration failed')
    })

    it('should not sign up a user with an invalid email', async () => {
      const response = await agent.post('/accounts').send({
        username: chance.word({ length: 10 }),
        email: 'invalid-email',
        password: getValidPassword(),
      })
      expect(response.status).toBe(400)
      expect(response.body.validation.body.keys).toEqual(
        expect.arrayContaining(['email'])
      )
    })

    it('should not sign up a user with a too short password', async () => {
      const response = await agent.post('/accounts').send({
        username: chance.word({ length: 10 }),
        email: chance.email(),
        password: 'short',
      })
      expect(response.status).toBe(400)
      expect(response.body.validation.body.keys).toEqual(
        expect.arrayContaining(['password'])
      )
    })

    it('should not sign up a user with a password without numbers', async () => {
      const response = await agent.post('/accounts').send({
        username: chance.word({ length: 10 }),
        email: chance.email(),
        password: 'password',
      })
      expect(response.status).toBe(400)
      expect(response.body.validation.body.keys).toEqual(
        expect.arrayContaining(['password'])
      )
    })

    it('should not sign up a user with a password without uppercase letters', async () => {
      const response = await agent.post('/accounts').send({
        username: chance.word({ length: 10 }),
        email: chance.email(),
        password: 'password123',
      })
      expect(response.status).toBe(400)
      expect(response.body.validation.body.keys).toEqual(
        expect.arrayContaining(['password'])
      )
    })

    it('should not sign up a user with a password without lowercase letters', async () => {
      const response = await agent.post('/accounts').send({
        username: chance.word({ length: 10 }),
        email: chance.email(),
        password: 'PASSWORD123',
      })
      expect(response.status).toBe(400)
      expect(response.body.validation.body.keys).toEqual(
        expect.arrayContaining(['password'])
      )
    })

    it('should not sign up a user with a password without special characters', async () => {
      const response = await agent.post('/accounts').send({
        username: chance.word({ length: 10 }),
        email: chance.email(),
        password: 'Password123',
      })
      expect(response.status).toBe(400)
      expect(response.body.validation.body.keys).toEqual(
        expect.arrayContaining(['password'])
      )
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
