const mongoose = require('mongoose')
const dbConnection = require('../src/database-connection')
const User = require('../src/models/user')
const BookInfo = require('../src/models/book-info')
const Library = require('../src/models/library')

beforeAll(async () => {
  await dbConnection
  await User.deleteMany({})
  await BookInfo.deleteMany({})
  await Library.deleteMany({})
})

afterAll(() => {
  mongoose.disconnect()
})
