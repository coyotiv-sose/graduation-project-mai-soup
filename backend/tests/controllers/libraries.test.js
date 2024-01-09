// TODO: actually test all methods not just what coverage didnt like

const createError = require('http-errors')
const {
  generateEnhancedDescription,
} = require('../../src/controllers/libraries')

it('should return 400 when description is empty', () => {
  const req = {
    body: {
      description: '',
    },
  }
  const res = {
    sendStatus: jest.fn(),
  }
  const next = jest.fn()

  generateEnhancedDescription(req, res, next)

  expect(next).toHaveBeenCalledWith(createError(400, 'Missing description'))
})

// TODO: jest really didn't like this one, the description keeps being generated
// after the test timeout, no matter how long. see how to fix.
// it('should return enhanced description', async done => {
//   const req = {
//     body: {
//       description: 'This is a description',
//     },
//   }
//   const res = {
//     send: jest.fn(),
//   }
//   const next = jest.fn()

//   await generateEnhancedDescription(req, res, next)

//   expect(res.send).toHaveBeenCalled()

//   done()
// })
