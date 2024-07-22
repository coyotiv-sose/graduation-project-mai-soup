const mongoose = require('mongoose')

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

afterAll(async () => {
  await mongoose.disconnect()
})
