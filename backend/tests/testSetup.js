const mongoose = require('mongoose')
const dbConnection = require('../src/database-connection')

beforeAll(async () => {
  const connection = await dbConnection
  await connection.dropDatabase()
})

afterAll(() => {
  mongoose.disconnect()
})
