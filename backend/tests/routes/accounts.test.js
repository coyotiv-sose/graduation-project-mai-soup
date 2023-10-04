const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')

const User = require('../../src/models/user')

// use agent to persist cookies between requests
const agent = request.agent(app)
const validUsername = chance.word({ length: 10 })
const validEmail = chance.email()
const validPassword = chance.word()

it('should sign up a user', async () => {
  const response = await agent.post('/accounts').send({
    username: validUsername,
    email: validEmail,
    password: validPassword,
  })

  expect(response.status).toBe(200)
  expect(response.body).toMatchObject({
    username: validUsername,
    email: validEmail,
  })
})

it('should not sign up a user with an existing username', async () => {
  const testUsername = chance.word()

  await request(app).post('/accounts').send({
    username: testUsername,
    email: chance.email(),
    password: chance.word(),
  })

  const response = await request(app).post('/accounts').send({
    username: testUsername,
    email: chance.email(),
    password: chance.word(),
  })

  expect(response.status).toBe(400)
})

it('should not sign up a user with an existing email', async () => {
  const testEmail = chance.email()
  await request(app)
    .post('/accounts')
    .send({
      username: chance.word({ length: 10 }),
      email: testEmail,
      password: chance.word(),
    })

  const response = await request(app)
    .post('/accounts')
    .send({
      username: chance.word({ length: 10 }),
      email: testEmail,
      password: chance.word(),
    })

  expect(response.status).toBe(400)
})

// TODO: uncomment when validation implemented
// it('should not sign up a user with an invalid email', async () => {
//   const response = await request(app).post('/accounts').send({
//     username: chance.word(),
//     email: chance.word(),
//     password: chance.word(),
//   })

//   expect(response.status).toBe(400)
// })

// TODO: uncomment when validation implemented
// it('should not sign up a user with a username that is too short', async () => {
//   const response = await request(app)
//     .post('/accounts')
//     .send({
//       username: chance.string({ length: 4 }),
//       email: chance.email(),
//       password: chance.word(),
//     })

//   expect(response.status).toBe(400)
// })

it('should not sign up a user with no username', async () => {
  const response = await request(app).post('/accounts').send({
    username: '',
    email: chance.email(),
    password: chance.word(),
  })

  expect(response.status).toBe(400)
})

it('should not sign up a user with no email', async () => {
  const response = await request(app)
    .post('/accounts')
    .send({
      username: chance.word({ length: 10 }),
      email: '',
      password: chance.word(),
    })

  expect(response.status).toBe(400)
})

it('should not sign up a user with no password', async () => {
  const response = await request(app)
    .post('/accounts')
    .send({
      username: chance.word({}),
      email: chance.email(),
      password: '',
    })
  expect(response.status).toBe(400)
})

it('should sign in a user', async () => {
  const response = await agent.post('/accounts/session').send({
    username: validUsername,
    password: validPassword,
  })

  expect(response.status).toBe(200)
  expect(response.body).toMatchObject({
    username: validUsername,
    email: validEmail,
  })
})

it('should not sign in a user with an invalid username', async () => {
  const response = await request(app).post('/accounts/session').send({
    username: chance.word(),
    password: chance.word(),
  })

  expect(response.status).toBe(401)
})

it('should not sign in a user with an wrong password', async () => {
  const response = await request(app).post('/accounts/session').send({
    username: validUsername,
    password: chance.word(),
  })

  expect(response.status).toBe(401)
})

it('should not sign in a user with an invalid email', async () => {
  const response = await request(app).post('/accounts/session').send({
    username: chance.email(),
    password: chance.word(),
  })

  expect(response.status).toBe(401)
})

it('should not sign in a user without a password', async () => {
  const response = await request(app).post('/accounts/session').send({
    username: validUsername,
    password: '',
  })

  expect(response.status).toBe(400)
})

it('should sign out a user', async () => {
  const response = await agent.delete('/accounts/session')
  expect(response.status).toBe(200)
})

it('should not sign out a user if not signed in', async () => {
  const response = await request(app).delete('/accounts/session')
  expect(response.status).toBe(401)
})

it('should handle server errors when signing up a new user', async () => {
  User.register = jest.fn().mockRejectedValueOnce(new Error('Simulated Error'))

  const user = {
    username: chance.word(),
    email: chance.email(),
    password: chance.word(),
  }

  const response = await request(app).post('/accounts').send(user)
  // console.error('BODY:', response.text)
  expect(response.status).toBe(500)
})
