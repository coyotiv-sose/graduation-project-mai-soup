const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')
const BookInfo = require('../../src/models/book-info')
const getValidPassword = require('../generateValidPassword')

const agent = request.agent(app)

// donna tartt's goldfinch
const validOpenLibraryId = 'OL16809803W'
// danielewski's house of leaves
const anotherValidOpenLibraryId = 'OL32197W'

beforeAll(async () => {
  const username = chance.word({ length: 10 })
  const password = getValidPassword()

  await agent.post('/accounts').send({
    username,
    email: chance.email(),
    password,
  })

  await agent.post('/accounts/session').send({
    username,
    password,
  })

  // await book info to be deleted because tests depend on unique keys
  await BookInfo.deleteMany({})
})

it('should not allow getting all books without auth', async () => {
  const response = await request(app).get('/books')
  expect(response.status).toBe(401)
})

it('should not allow getting a single book without auth', async () => {
  const response = await request(app).get('/books/1')
  expect(response.status).toBe(401)
})

it('should not allow creating a new book without auth', async () => {
  const response = await request(app).post('/books')
  expect(response.status).toBe(401)
})

it('should create a new book with a valid openLibraryId', async () => {
  const response = await agent.post('/books').send({ id: validOpenLibraryId })
  expect(response.status).toBe(201)
  expect(response.body.openLibraryId).toBe(validOpenLibraryId)
})

it('should not create a new book without an id', async () => {
  const response = await agent.post('/books').send({})
  expect(response.status).toBe(400)
})

// TODO: tests for invalid id and api being down

it('should not create a new book with a duplicate id', async () => {
  await agent.post('/books').send({ id: anotherValidOpenLibraryId })
  const response = await agent
    .post('/books')
    .send({ id: anotherValidOpenLibraryId })
  expect(response.status).toBe(409)
})

it('should send 500 if encountering server error', async () => {
  jest.spyOn(BookInfo, 'findOne').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response = await agent.post('/books').send({ id: validOpenLibraryId })
  expect(response.status).toBe(500)
})

it('should get all books', async () => {
  const response = await agent.get('/books')
  expect(response.status).toBe(200)
})

it('should return 500 upon server error when getting all books', async () => {
  jest.spyOn(BookInfo, 'find').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response = await agent.get('/books')
  expect(response.status).toBe(500)
})

it('should find books by title', async () => {
  const title = 'Goldfinch'
  const response = await agent.get(`/books?q=${title}`)

  expect(response.status).toBe(200)
  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        openLibraryId: validOpenLibraryId,
        title: expect.stringMatching(title),
      }),
    ])
  )
})

it('should find books by author', async () => {
  const author = 'Tartt'
  const response = await agent.get(`/books?q=${author}`)

  expect(response.status).toBe(200)
  expect(response.body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        openLibraryId: validOpenLibraryId,
        authors: expect.arrayContaining([expect.stringMatching(author)]),
      }),
    ])
  )
})

it('should return 404 when searching for a query that is not in db', async () => {
  const fakeQuery = chance.word().repeat(10)
  const response = await agent.get(`/books?q=${fakeQuery}`)

  expect(response.status).toBe(404)
})

it('should get a single book', async () => {
  const response = await agent.get(`/books/${validOpenLibraryId}`)
  expect(response.status).toBe(200)
  expect(response.body.openLibraryId).toBe(validOpenLibraryId)
})

it('should return not found on non-existent book id', async () => {
  const response = await agent.get(`/books/${chance.word()}`)
  expect(response.status).toBe(404)
})

it('should return 500 upon server error when getting a single book', async () => {
  jest.spyOn(BookInfo, 'findOne').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response = await agent.get(`/books/${validOpenLibraryId}`)
  expect(response.status).toBe(500)
})
