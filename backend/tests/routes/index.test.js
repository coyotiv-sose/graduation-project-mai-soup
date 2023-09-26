const request = require('supertest')
const app = require('../../src/app')

it('should return a 404 for an invalid route', async () => {
  const response = await request(app).get('/invalid-route')

  expect(response.status).toBe(404)
})

it('should return 418 for index route', async () => {
  const response = await request(app).get('/')

  expect(response.status).toBe(418)
})

it('should use <br /> as line separator for html', async () => {
  const response = await request(app).get('/').set('Accept', 'text/html')

  expect(response.text).toMatch(/<br\s*\/?>/)
})

it('should return a plain string for json', async () => {
  const response = await request(app).get('/').set('Accept', 'application/json')

  expect(response.text).toBe(`I'm a teapot`)
})
