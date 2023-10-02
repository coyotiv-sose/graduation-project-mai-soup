const request = require('supertest')
const mongoose = require('mongoose')
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

it('should handle server errors when listing libraries', async () => {
  jest.spyOn(Library, 'find').mockRejectedValueOnce(new Error('oops'))

  const response = await request(app).get('/libraries')
  expect(response.status).toBe(500)
})

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

it('should handle server errors when creating a library', async () => {
  jest.spyOn(Library, 'create').mockRejectedValueOnce(new Error('oops'))

  const response = await agentOwner.post('/libraries').send({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
  })
  expect(response.status).toBe(500)
})

it('should not let unauthenticated users join a library', async () => {
  // TODO: refactor library creation to its own function, repetitive
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })

  const response = await request(app).post(`/libraries/${library._id}/members`)
  expect(response.status).toBe(401)
})

it('should let an authenticated user join a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })

  const response = await agentMember.post(`/libraries/${library._id}/members`)
  expect(response.status).toBe(201)
})

it('library owner should be a member by default', async () => {
  const name = 'Tester Library'
  const location = 'Minnesota'

  const response = await agentOwner.post('/libraries').send({ name, location })
  expect(response.body.members).toEqual(
    expect.arrayContaining([expect.objectContaining({ _id: ownerId })])
  )
})

it('should return 404 when attempting to join a non-existent library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentMember.post(`/libraries/${fakeId}/members`)
  expect(response.status).toBe(404)
})

it('should return 500 when server error occurs when joining a library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  jest.spyOn(Library, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await agentMember.post(`/libraries/${fakeId}/members`)
  expect(response.status).toBe(500)
})

it('should return 204 when user leaves a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })

  await agentMember.post(`/libraries/${library._id}/members`)

  const response = await agentMember
    .patch(`/libraries/${library._id}/members`)
    .send({ remove: true })
  expect(response.status).toBe(204)
})

it('should return 404 when attempting to leave a non-existent library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentMember
    .patch(`/libraries/${fakeId}/members`)
    .send({ remove: true })
  expect(response.status).toBe(404)
})

it('should return 500 when server error occurs when leaving a library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  jest.spyOn(Library, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await agentMember
    .patch(`/libraries/${fakeId}/members`)
    .send({ remove: true })
  expect(response.status).toBe(500)
})

it('should return 400 when attempting to patch library members without body', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const response = await agentMember.patch(`/libraries/${library._id}/members`)
  expect(response.status).toBe(400)
})

it('should return 400 when attempting to patch library members without remove in body', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const response = await agentMember
    .patch(`/libraries/${library._id}/members`)
    .send({ foo: 'bar' })
  expect(response.status).toBe(400)
})

it('should get all members of a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })

  const response = await agentMember.get(`/libraries/${library._id}/members`)
  expect(response.status).toBe(200)
})

it('should return 404 when attempting to get members of a non-existent library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentMember.get(`/libraries/${fakeId}/members`)
  expect(response.status).toBe(404)
})

it('should return 500 when server error occurs when getting members of a library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  jest.spyOn(Library, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await agentMember.get(`/libraries/${fakeId}/members`)
  expect(response.status).toBe(500)
})

it('should not allow unauthenticated users to patch a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const response = await request(app).patch(`/libraries/${library._id}`)
  expect(response.status).toBe(401)
})

it('should not allow users to patch a library they are not the owner of', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const response = await agentMember.patch(`/libraries/${library._id}`)
  expect(response.status).toBe(403)
})

it('should return not found when attempting to patch a non-existent library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentOwner.patch(`/libraries/${fakeId}`)
  expect(response.status).toBe(404)
})

it('should patch library with any combination of valid fields', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const newName = chance.word({ length: 5 })
  const newLocation = chance.word({ length: 5 })

  const responseName = await agentOwner
    .patch(`/libraries/${library._id}`)
    .send({
      name: newName,
    })
  // console.error('name response', responseName)
  expect(responseName.status).toBe(200)
  expect(responseName.body.name).toBe(newName)

  const responseLocation = await agentOwner
    .patch(`/libraries/${library._id}`)
    .send({
      location: newLocation,
    })
  expect(responseLocation.status).toBe(200)
  expect(responseLocation.body.location).toBe(newLocation)

  const newestName = chance.word({ length: 5 })
  const newestLocation = chance.word({ length: 5 })

  const responseBoth = await agentOwner
    .patch(`/libraries/${library._id}`)
    .send({
      name: newestName,
      location: newestLocation,
    })
  expect(responseBoth.status).toBe(200)
  expect(responseBoth.body.name).toBe(newestName)
  expect(responseBoth.body.location).toBe(newestLocation)
})
