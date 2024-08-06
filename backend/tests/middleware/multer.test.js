const express = require('express')
const request = require('supertest')
const { singleFile } = require('../../src/middleware/multer')

const app = express()
app.use(express.json()) // To parse JSON bodies
app.use(express.urlencoded({ extended: true })) // To parse URL-encoded bodies

app.post('/upload', singleFile, (req, res) => {
  res.status(200).send('File uploaded successfully')
})

describe('multer middleware', () => {
  it('should call next with no error for valid file', async () => {
    const file = Buffer.from('sample file content')

    await request(app)
      .post('/upload')
      .attach('file', file, 'test.txt')
      .expect(200)
      .expect('File uploaded successfully')
  })

  it('should call next with 413 error for file size limit exceeded', async () => {
    const file = Buffer.alloc(17 * 1024 * 1024, 'a') // 17MB file

    await request(app)
      .post('/upload')
      .attach('file', file, 'large-file.txt')
      .expect(413)
  })
})
