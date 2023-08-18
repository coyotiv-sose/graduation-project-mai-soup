const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')
const Library = require('../../src/models/library')

// restore the original behavior of mocked functions
afterEach(() => {
  jest.restoreAllMocks()
})

// TODO: rewrite to account for auth
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
  jest.spyOn(Library, 'find').mockRejectedValue(new Error('oops'))

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

//   // eslint-disable-next-line no-underscore-dangle
//   const response = await request(app).get(`/libraries/${library._id}`)
//   expect(response.status).toBe(200)
//   expect(response.body).toMatchObject({
//     name: library.name,
//     longitude: library.longitude,
//     latitude: library.latitude,
//   })
// })

it('should handle server errors when getting a library by id', async () => {
  jest.spyOn(Library, 'findById').mockRejectedValue(new Error('oops'))

  const response = await request(app).get(`/libraries/${chance.word()}`)
  expect(response.status).toBe(500)
})

it('should handle not found errors when getting a library by id', async () => {
  jest.spyOn(Library, 'findById').mockResolvedValue(null)

  const response = await request(app).get(`/libraries/${chance.word()}`)
  expect(response.status).toBe(404)
})
