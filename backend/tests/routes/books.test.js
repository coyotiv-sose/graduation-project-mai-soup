const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')
const mongoose = require('mongoose')
const Book = require('../../src/models/book')
const getValidPassword = require('../generateValidPassword')

const agent = request.agent(app)

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
})

it('should not allow getting all books without auth', async () => {
  const response = await request(app).get('/books')
  expect(response.status).toBe(401)
})

it('should not allow getting a single book without auth', async () => {
  const response = await request(app).get('/books/1')
  expect(response.status).toBe(401)
})

it('should not allow creating a new book through this route', async () => {
  const response = await request(app).post('/books')
  expect(response.status).toBe(404)
})

it('should send 500 if encountering server error on getting single book', async () => {
  jest.spyOn(Book, 'findOne').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response = await agent.get('/books/1')
  expect(response.status).toBe(500)
})

it('should get all books', async () => {
  const response = await agent.get('/books')
  expect(response.status).toBe(200)
})

it('should return 500 upon server error when getting all books', async () => {
  jest.spyOn(Book, 'find').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response = await agent.get('/books')
  expect(response.status).toBe(500)
})

it('should get a single book', async () => {
  const testTitle = chance.word()
  const testAuthors = chance.word()
  const fakeId = new mongoose.Types.ObjectId()

  const book = await Book.create({
    title: testTitle,
    authors: testAuthors,
    library: fakeId,
  })

  const response = await agent.get(`/books/${book._id}`)
  expect(response.status).toBe(200)
  expect(response.body).toMatchObject({
    title: testTitle,
    authors: testAuthors,
  })
})

it('should return not found on non-existent book id', async () => {
  const fakeId = new mongoose.Types.ObjectId()
  const response = await agent.get(`/books/${fakeId}`)
  expect(response.status).toBe(404)
})
