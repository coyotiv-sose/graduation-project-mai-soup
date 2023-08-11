const dbConnection = require('../src/database-connection')

beforeAll(async () => {
  await dbConnection
})

afterAll(() => {
  require('mongoose').disconnect()
})
