const createError = require('http-errors')
const User = require('../../src/models/user')
const {
  registerUser,
  getAuthenticatedUser,
  logoutAndDestroySession,
} = require('../../src/controllers/accounts')

jest.mock('../../src/models/user')

describe('Accounts Controller', () => {
  describe('registerUser', () => {
    it('should register a new user', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        },
      }
      const res = {
        send: jest.fn(),
      }
      const next = jest.fn()

      User.register.mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com',
      })

      User.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          _id: 'mockedId',
          username: 'testuser',
          email: 'test@example.com',
        }),
      })

      await registerUser(req, res, next)

      // expect(res.send).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle registration errors', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        },
      }
      const res = {
        send: jest.fn(),
      }
      const next = jest.fn()

      const error = new Error('Simulated Error')
      User.register.mockRejectedValue(error)

      await registerUser(req, res, next)

      expect(next).toHaveBeenCalledWith(createError(500, error))
      expect(res.send).not.toHaveBeenCalled()
    })

    it('should handle existing username error', async () => {
      const req = {
        body: {
          username: 'existinguser',
          email: 'test2@example.com',
          password: 'password123',
        },
      }
      const res = {
        send: jest.fn(),
      }
      const next = jest.fn()

      const error = new Error('UserExistsError')
      error.name = 'UserExistsError'
      User.register.mockRejectedValue(error)

      await registerUser(req, res, next)

      expect(next).toHaveBeenCalledWith(createError(400, 'Registration failed'))
      expect(res.send).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'invalidemail',
          password: 'short',
        },
      }
      const res = {
        send: jest.fn(),
      }
      const next = jest.fn()

      const error = new Error('ValidationError')
      error.name = 'ValidationError'
      User.register.mockRejectedValue(error)

      await registerUser(req, res, next)

      expect(next).toHaveBeenCalledWith(createError(400, 'Registration failed'))
      expect(res.send).not.toHaveBeenCalled()
    })
  })

  describe('getAuthenticatedUser', () => {
    it('should return the authenticated user', () => {
      const req = { user: { username: 'testuser', email: 'test@example.com' } }
      const res = {
        send: jest.fn(),
      }

      getAuthenticatedUser(req, res)

      expect(res.send).toHaveBeenCalledWith(req.user)
    })
  })

  describe('logoutAndDestroySession', () => {
    it('should send 500 status code when logout fails', done => {
      const req = {}
      const res = {
        sendStatus: jest.fn(),
      }
      const next = jest.fn()

      req.logout = callback => {
        callback(new Error('Logout failed'))
      }

      logoutAndDestroySession(req, res, next)

      expect(next).toHaveBeenCalledWith(createError(500, 'Logout failed'))
      expect(res.sendStatus).not.toHaveBeenCalled()

      done()
    })

    it('should send 200 status code on successful logout', done => {
      const req = {}
      const res = {
        sendStatus: jest.fn(),
      }
      const next = jest.fn()

      req.logout = callback => {
        callback()
      }

      logoutAndDestroySession(req, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(200)
      expect(next).not.toHaveBeenCalled()

      done()
    })
  })
})
