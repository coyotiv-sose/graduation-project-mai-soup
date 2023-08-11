const dbConnection = require('../src/database-connection')
const mongoose = require('mongoose')
const User = require('../src/models/user')
const Book = require('../src/models/book')
const Library = require('../src/models/library')

beforeAll(async () => {
  await dbConnection
  await User.deleteMany({})
  await Book.deleteMany({})
  await Library.deleteMany({})
})

afterAll(() => {
  mongoose.disconnect()
})
