const createError = require('http-errors')
const { logoutAndDestroySession } = require('../../src/controllers/accounts')

it('should send 500 status code when logout fails', done => {
  const req = {}
  const res = {
    sendStatus: jest.fn(),
  }
  const next = jest.fn()

  // Mocking the req.logout method to simulate an error
  req.logout = callback => {
    callback(new Error('Logout failed'))
  }

  logoutAndDestroySession(req, res, next)

  // Ensure that next is called with 500
  expect(next).toHaveBeenCalledWith(createError(500, 'Logout failed'))

  // expect sendStatus to not have been called
  expect(res.sendStatus).not.toHaveBeenCalled()

  done()
})
