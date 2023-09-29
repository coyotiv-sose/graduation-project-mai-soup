const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')
const Library = require('../../src/models/library')

let ownerId = ''
const agentOwner = request.agent(app)
const agentMember = request.agent(app)
const agentAnother = request.agent(app)

beforeAll(async () => {
  // TODO: refactor to be less repetitive
  const usernameOwner = chance.word()
  const passwordOwner = chance.word()
  const usernameMember = chance.word()
  const passwordMember = chance.word()
  const usernameAnother = chance.word()
  const passwordAnother = chance.word()

  const res = await agentOwner.post('/accounts').send({
    username: usernameOwner,
    email: chance.email(),
    password: passwordOwner,
  })

  ownerId = res.body._id

  await agentOwner.post('/accounts/session').send({
    username: usernameOwner,
    password: passwordOwner,
  })

  await agentMember.post('/accounts').send({
    username: usernameMember,
    email: chance.email(),
    password: passwordMember,
  })

  await agentMember.post('/accounts/session').send({
    username: usernameMember,
    password: passwordMember,
  })

  await agentAnother.post('/accounts').send({
    username: usernameAnother,
    email: chance.email(),
    password: passwordAnother,
  })

  await agentAnother.post('/accounts/session').send({
    username: usernameAnother,
    password: passwordAnother,
  })
})

it('should allow access to all libraries without authentication', async () => {
  const response = await request(app).get('/libraries')

  expect(response.status).toBe(200)
})

it('should allow access to all libraries with authentication', async () => {
  const response = await agentOwner.get('/libraries')
  expect(response.status).toBe(200)
})

it('should not allow posting a new library without auth', async () => {
  const response = await request(app).post('/libraries')
  expect(response.status).toBe(401)
})

it('should create a library for an authenticated user with valid data', async () => {
  const name = 'Test Library'
  const location = 'Minnesota'

  const response = await agentOwner.post('/libraries').send({ name, location })
  expect(response.status).toBe(201)
  expect(response.body).toMatchObject({
    name,
    location,
  })
})

it('should not create a library with invalid data', async () => {
  const emptyRes = await agentOwner.post('/libraries').send({})
  expect(emptyRes.status).toBe(400)

  const noNameRes = await agentOwner
    .post('/libraries')
    .send({ location: 'Minnesota' })
  expect(noNameRes.status).toBe(400)

  const noLocationRes = await agentOwner
    .post('/libraries')
    .send({ name: `${chance.word()} Library` })
  expect(noLocationRes.status).toBe(400)
})

it('should allow access to a single library with or without authentication', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })

  const unauthRes = await request(app).get(`/libraries/${library.id}`)
  expect(unauthRes.status).toBe(200)
  expect(unauthRes.body).toMatchObject({
    _id: library.id,
    name: library.name,
    location: library.location,
    geometry: {
      type: 'Point',
      coordinates: library.geometry.coordinates,
    },
  })

  const authRes = await agentOwner.get(`/libraries/${library.id}`)
  expect(authRes.status).toBe(200)
  expect(authRes.body).toMatchObject({
    _id: library.id,
    name: library.name,
    location: library.location,
    geometry: {
      type: 'Point',
      coordinates: library.geometry.coordinates,
    },
  })
})

// shouldnt edit lib without authing as owner
// shouldnt add book without authing as owner
// shouldnt join lib without authing
// shouldnt leave lib without authing as member
// shouldnt patch copies without authing as member

// it('should list all libraries', async () => {
//   const owner = await User.create({
//     username: chance.word({ length: 5 }),
//     email: chance.email(),
//   })

//   const library1 = {
//     name: chance.word({ length: 25 }),
//     longitude: chance.longitude(),
//     latitude: chance.latitude(),
//   }
//   const library2 = {
//     name: chance.word({ length: 25 }),
//     longitude: chance.longitude(),
//     latitude: chance.latitude(),
//   }
//   await owner.createLibrary(library1)
//   await owner.createLibrary(library2)

//   const response = await request(app).get('/libraries')
//   expect(response.status).toBe(200)
//   expect(response.body).toMatchObject(
//     expect.arrayContaining([
//       expect.objectContaining(library1),
//       expect.objectContaining(library2),
//     ])
//   )
// })

it('should handle server errors when listing libraries', async () => {
  jest.spyOn(Library, 'find').mockRejectedValueOnce(new Error('oops'))

  const response = await request(app).get('/libraries')
  expect(response.status).toBe(500)
})

// TODO: rewrite to account for auth
// it('should get a library by id', async () => {
//   const owner = await User.create({
//     username: chance.word({ length: 5 }),
//     email: chance.email(),
//   })

//   const library = await owner.createLibrary({
//     name: chance.word({ length: 25 }),
//     longitude: chance.longitude(),
//     latitude: chance.latitude(),
//   })

//   const response = await request(app).get(`/libraries/${library._id}`)
//   expect(response.status).toBe(200)
//   expect(response.body).toMatchObject({
//     name: library.name,
//     longitude: library.longitude,
//     latitude: library.latitude,
//   })
// })

it('should handle server errors when getting a library by id', async () => {
  jest.spyOn(Library, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await request(app).get(`/libraries/${chance.word()}`)
  expect(response.status).toBe(500)
})

it('should handle not found errors when getting a library by id', async () => {
  jest.spyOn(Library, 'findById').mockResolvedValueOnce(null)

  const response = await request(app).get(`/libraries/${chance.word()}`)
  expect(response.status).toBe(404)
})
