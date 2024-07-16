const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongoMemServer

beforeAll(async () => {
  mongoMemServer = await MongoMemoryServer.create()
  const uri = mongoMemServer.getUri()

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

afterAll(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }

  await mongoose.disconnect()
  await mongoMemServer.stop()
})
