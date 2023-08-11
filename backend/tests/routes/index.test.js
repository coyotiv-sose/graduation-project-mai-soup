const request = require('supertest')
const app = require('../../src/app')

it('should return a 404 for an invalid route', async () => {
  const response = await request(app).get('/invalid-route')

  expect(response.status).toBe(404)
})
