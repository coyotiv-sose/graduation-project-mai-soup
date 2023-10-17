const request = require('supertest')
const mongoose = require('mongoose')
const chance = require('chance').Chance()
const app = require('../../src/app')
const Library = require('../../src/models/library')
const BookCopy = require('../../src/models/book-copy')
const getValidPassword = require('../generateValidPassword')

const validOpenLibraryId = 'OL468431W'
const anotherValidOpenLibraryId = 'OL63073W'
let ownerId = ''
const agentOwner = request.agent(app)
const agentMember = request.agent(app)
const agentAnother = request.agent(app)

beforeAll(async () => {
  // TODO: refactor to be less repetitive
  const usernameOwner = chance.word({ length: 10 })
  const passwordOwner = getValidPassword()
  const usernameMember = chance.word({ length: 10 })
  const passwordMember = getValidPassword()
  const usernameAnother = chance.word({ length: 10 })
  const passwordAnother = getValidPassword()

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

it('should patch library with valid fields', async () => {
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

  const response = await agentOwner.patch(`/libraries/${library._id}`).send({
    name: newName,
    location: newLocation,
  })
  expect(response.status).toBe(200)
  expect(response.body.name).toBe(newName)
  expect(response.body.location).toBe(newLocation)
})

it('should handle server errors when patching library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  jest.spyOn(Library, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await agentOwner.patch(`/libraries/${fakeId}`)
  expect(response.status).toBe(500)
})

it('should not allow unauthenticated users to add copies to a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const response = await request(app).post(`/libraries/${library._id}/copies`)
  expect(response.status).toBe(401)
})

it('should not allow users to add copies to a library they are not the owner of', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const response = await agentMember.post(`/libraries/${library._id}/copies`)
  expect(response.status).toBe(403)
})

it('should return not found when attempting to add copies to a non-existent library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentOwner.post(`/libraries/${fakeId}/copies`)
  expect(response.status).toBe(404)
})

it('should add copies to a library with a new openLibraryId', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const response = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: validOpenLibraryId,
    })

  expect(response.status).toBe(201)
  expect(response.body.books).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        bookInfo: expect.objectContaining({
          openLibraryId: validOpenLibraryId,
        }),
      }),
    ])
  )
})

it('should add multiple copies of the same book to a library and not call the api multiple times', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  await agentOwner.post(`/libraries/${library._id}/copies`).send({
    openLibraryId: anotherValidOpenLibraryId,
  })

  const response = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })
  expect(response.status).toBe(201)
  expect(response.body.books).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        bookInfo: expect.objectContaining({
          openLibraryId: anotherValidOpenLibraryId,
        }),
      }),
      expect.objectContaining({
        bookInfo: expect.objectContaining({
          openLibraryId: anotherValidOpenLibraryId,
        }),
      }),
    ])
  )
})

it('should handle server errors when adding copies to a library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  jest.spyOn(Library, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await agentOwner.post(`/libraries/${fakeId}/copies`)
  expect(response.status).toBe(500)
})

it('should not allow unauthenticated user to remove a copy from a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const fakeId = new mongoose.Types.ObjectId()
  const response = await request(app).delete(
    `/libraries/${library._id}/copies/${fakeId}`
  )
  expect(response.status).toBe(401)
})

it('should not allow users to remove copies from a library they are not the owner of', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentMember.delete(
    `/libraries/${library._id}/copies/${fakeId}`
  )
  expect(response.status).toBe(403)
})

it('should return not found when attempting to remove a copy from a non-existent library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentOwner.delete(
    `/libraries/${fakeId}/copies/${fakeId}`
  )
  expect(response.status).toBe(404)
})

it('should return not found when attempting to remove a non-existent copy from a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentOwner.delete(
    `/libraries/${library._id}/copies/${fakeId}`
  )
  expect(response.status).toBe(404)
})

it('should remove a copy from a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })

  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  const response = await agentOwner.delete(
    `/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`
  )

  expect(response.status).toBe(204)
})

it('should only remove one copy if a library has multiple copies of the same book', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })

  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentOwner.post(`/libraries/${library._id}/copies`).send({
    openLibraryId: anotherValidOpenLibraryId,
  })

  const response = await agentOwner.delete(
    `/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`
  )

  const libraryAfter = await Library.findById(library._id)

  expect(response.status).toBe(204)
  expect(libraryAfter.books.length).toBe(1)
  expect(libraryAfter.books).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        bookInfo: expect.objectContaining({
          openLibraryId: anotherValidOpenLibraryId,
        }),
      }),
    ])
  )
})

it('should handle server errors when removing a copy from a library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  jest.spyOn(Library, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await agentOwner.delete(
    `/libraries/${fakeId}/copies/${fakeId}`
  )
  expect(response.status).toBe(500)
})

it('should not allow unauthenticated user to update a copy in a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const fakeId = new mongoose.Types.ObjectId()
  const response = await request(app).patch(
    `/libraries/${library._id}/copies/${fakeId}`
  )
  expect(response.status).toBe(401)
})

// it('should not allow users that are not members of a library to update a copy in a library', async () => {
//   const library = await Library.create({
//     name: chance.word({ length: 5 }),
//     location: chance.word({ length: 5 }),
//     geometry: {
//       type: 'Point',
//       coordinates: [chance.longitude(), chance.latitude()],
//     },
//     owner: ownerId,
//   })
//   const fakeId = new mongoose.Types.ObjectId()
//   const response = await agentMember.patch(
//     `/libraries/${library._id}/copies/${fakeId}`
//   )
//   expect(response.status).toBe(403)
// })

it('should return not found when attempting to update a copy in a non-existent library', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentOwner.patch(
    `/libraries/${fakeId}/copies/${fakeId}`
  )
  expect(response.status).toBe(404)
})

it('should return not found when attempting to update a non-existent copy in a library', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agentOwner.patch(
    `/libraries/${library._id}/copies/${fakeId}`
  )
  expect(response.status).toBe(404)
})

it('should return 400 when no action is specified in a copy update', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  const response = await agentOwner
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ foo: 'bar' })

  expect(response.status).toBe(400)
})

it('should return 400 when an invalid action is specified in a copy update', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  const response = await agentOwner
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'foo' })

  expect(response.status).toBe(400)
})

it('should allow members to patch a copy as borrowed and then returned', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)

  const responseBorrow = await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  expect(responseBorrow.status).toBe(200)
  expect(responseBorrow.body.status).toBe('borrowed')

  const responseReturn = await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'return' })

  expect(responseReturn.status).toBe(200)
  expect(responseReturn.body.status).toBe('available')
})

it('shouldnt allow members to patch a copy as returned if they have not borrowed it', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)

  const responseReturn = await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'return' })

  expect(responseReturn.status).toBe(403)
})

it('shouldnt allow a member to patch a copy as borrowed if it is already borrowed', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)
  await agentAnother.post(`/libraries/${library._id}/members`)

  await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  const responseBorrow = await agentAnother
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  expect(responseBorrow.status).toBe(403)

  const responseRepeatBorrow = await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  expect(responseRepeatBorrow.status).toBe(403)
})

it('shouldnt allow unauthenticated users to extend a loan', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  const response = await request(app)
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'extend' })

  expect(response.status).toBe(401)
})

it('shouldnt allow users to extend a loan if they are not a member', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  const response = await agentAnother
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'extend' })

  expect(response.status).toBe(403)
})

it('shouldnt allow users to extend a loan if the copy is not borrowed', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)

  const response = await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'extend' })

  expect(response.status).toBe(403)
})

it('should not allow another member to extend someone elses loan', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)
  await agentAnother.post(`/libraries/${library._id}/members`)

  await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  const response = await agentAnother
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'extend' })

  expect(response.status).toBe(403)
})

it('should not allow a member to extend a loan that has more than 7 days remaining', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)

  await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  const response = await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'extend' })

  expect(response.status).toBe(403)
})

it('should allow a member to extend a loan that has less than 7 days remaining', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)

  await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  await BookCopy.findOneAndUpdate(
    { _id: copyAdded.body.books[0]._id },
    {
      $set: {
        returnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      },
    }
  )

  const response = await agentMember
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'extend' })

  expect(response.status).toBe(200)
  // return date should be 13 days after the previous value
  // time doesn't matter
  expect(new Date(response.body.returnDate).toISOString().slice(0, 10)).toBe(
    new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
})

// it('should not allow regular members to mark a copy as lost', async () => {
//   const library = await Library.create({
//     name: chance.word({ length: 5 }),
//     location: chance.word({ length: 5 }),
//     geometry: {
//       type: 'Point',
//       coordinates: [chance.longitude(), chance.latitude()],
//     },
//     owner: ownerId,
//   })
//   const copyAdded = await agentOwner
//     .post(`/libraries/${library._id}/copies`)
//     .send({
//       openLibraryId: anotherValidOpenLibraryId,
//     })

//   await agentMember.post(`/libraries/${library._id}/members`)

//   const response = await agentMember
//     .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
//     .send({ action: 'lose' })

//   expect(response.status).toBe(403)
// })

it('should allow the library owner to mark a copy as lost, no matter its status', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyToBorrow = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })
  const copyToLeaveAvailable = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  await agentMember.post(`/libraries/${library._id}/members`)
  await agentMember
    .patch(`/libraries/${library._id}/copies/${copyToBorrow.body.books[0]._id}`)
    .send({ action: 'borrow' })

  const responseBorrowed = await agentOwner
    .patch(`/libraries/${library._id}/copies/${copyToBorrow.body.books[0]._id}`)
    .send({ action: 'lose' })

  const responseAvailable = await agentOwner
    .patch(
      `/libraries/${library._id}/copies/${copyToLeaveAvailable.body.books[0]._id}`
    )
    .send({ action: 'lose' })

  expect(responseBorrowed.status).toBe(200)
  expect(responseAvailable.status).toBe(200)
})

it('should handle server errors when patching a copy', async () => {
  const library = await Library.create({
    name: chance.word({ length: 5 }),
    location: chance.word({ length: 5 }),
    geometry: {
      type: 'Point',
      coordinates: [chance.longitude(), chance.latitude()],
    },
    owner: ownerId,
  })
  const copyAdded = await agentOwner
    .post(`/libraries/${library._id}/copies`)
    .send({
      openLibraryId: anotherValidOpenLibraryId,
    })

  jest.spyOn(BookCopy, 'findById').mockRejectedValueOnce(new Error('oops'))

  const response = await agentOwner
    .patch(`/libraries/${library._id}/copies/${copyAdded.body.books[0]._id}`)
    .send({ action: 'borrow' })

  expect(response.status).toBe(500)
})
