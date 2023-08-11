const request = require('supertest')
const chance = require('chance').Chance()
const app = require('../../src/app')
const Book = require('../../src/models/book')
const e = require('express')

// restore the original behavior of mocked functions
afterEach(() => {
  jest.restoreAllMocks()
})

function generateISBN() {
  // Generate a random 9-digit number for ISBN-10 or 12-digit number for ISBN-13
  const isbnBase = chance.string({
    length: 12,
    pool: '0123456789',
  })

  // Compute the check digit
  const checkDigit = isbnBase.split('').reduce((sum, digit, index) => {
    return sum + (index % 2 === 0 ? parseInt(digit) : 3 * parseInt(digit))
  }, 0)

  // Compute the final check digit modulo 10 for ISBN-13
  const finalCheckDigit = (10 - (checkDigit % 10)) % 10

  return isbnBase + finalCheckDigit
}

it('should create a new book', async () => {
  // generate valid isbn, chance doesn't offer this directly
  const isbn = chance.string

  const book = {
    title: chance.sentence(),
    author: chance.name(),
    isbn: generateISBN(),
  }

  const response = await request(app).post('/books').send(book)
  expect(response.status).toBe(201)
  expect(response.body).toMatchObject(book)
})

it('should handle no or empty title', async () => {
  const book1 = {
    author: chance.name(),
    isbn: generateISBN(),
  }

  const response1 = await request(app).post('/books').send(book1)
  expect(response1.status).toBe(400)

  const book2 = {
    title: '',
    author: chance.name(),
    isbn: generateISBN(),
  }

  const response2 = await request(app).post('/books').send(book2)
  expect(response2.status).toBe(400)
})

it('should handle no or empty author', async () => {
  const book1 = {
    title: chance.sentence(),
    isbn: generateISBN(),
  }

  const response1 = await request(app).post('/books').send(book1)
  expect(response1.status).toBe(400)

  const book2 = {
    title: chance.sentence(),
    author: '',
    isbn: generateISBN(),
  }

  const response2 = await request(app).post('/books').send(book2)
  expect(response2.status).toBe(400)
})

it('should handle no or empty isbn', async () => {
  const book1 = {
    title: chance.sentence(),
    author: chance.name(),
  }

  const response1 = await request(app).post('/books').send(book1)
  expect(response1.status).toBe(400)

  const book2 = {
    title: chance.sentence(),
    author: chance.name(),
    isbn: '',
  }

  const response2 = await request(app).post('/books').send(book2)
  expect(response2.status).toBe(400)
})

it('should handle duplicate isbn', async () => {
  const book = {
    title: chance.sentence(),
    author: chance.name(),
    isbn: generateISBN(),
  }

  await Book.create(book)

  const book2 = {
    title: chance.sentence(),
    author: chance.name(),
    isbn: book.isbn,
  }

  const response = await request(app).post('/books').send(book2)
  expect(response.status).toBe(409)
})

it('should handle server error when creating a book', async () => {
  jest.spyOn(Book, 'create').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const book = {
    title: chance.sentence(),
    author: chance.name(),
    isbn: generateISBN(),
  }

  const response = await request(app).post('/books').send(book)
  expect(response.status).toBe(500)
})

it('should get a book by isbn', async () => {
  const book = {
    title: chance.sentence(),
    author: chance.name(),
    isbn: generateISBN(),
  }

  await Book.create(book)

  const response = await request(app).get(`/books/${book.isbn}`)
  console.log(response.body)
  expect(response.status).toBe(200)
  expect(response.body).toMatchObject(book)
})

it('should handle book not found', async () => {
  let isbn = generateISBN()
  while (await Book.exists({ isbn })) {
    isbn = generateISBN()
  }

  const response = await request(app).get(`/books/${isbn}`)
  expect(response.status).toBe(404)
})

it('should handle server error when getting a book', async () => {
  jest.spyOn(Book, 'findOne').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const book = {
    title: chance.sentence(),
    author: chance.name(),
    isbn: generateISBN(),
  }

  const response = await request(app).get(`/books/${book.isbn}`)
  expect(response.status).toBe(500)
})
