const FileType = require('file-type')
const createError = require('http-errors')
const fileIsImage = require('../../src/middleware/fileIsImage')

jest.mock('file-type')
jest.mock('http-errors')

describe('fileIsImage middleware', () => {
  let req, res, next
  const TEST_BUFFER = Buffer.from('actual image data')

  beforeAll(() => {
    req = {
      file: {
        buffer: TEST_BUFFER,
      },
    }
    res = {}
    next = jest.fn()
  })

  it('should call next() if no file is present', async () => {
    const { file, ...reqWithoutFile } = req
    await fileIsImage(reqWithoutFile, res, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('should call next() if file type is in whitelist', async () => {
    FileType.fromBuffer.mockResolvedValue({ mime: 'image/jpeg' })
    await fileIsImage(req, res, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('should call next with error if file type is not in whitelist', async () => {
    FileType.fromBuffer.mockResolvedValue({ mime: 'application/pdf' })
    const error = new Error('File type not accepted')
    createError.mockReturnValue(error)

    await fileIsImage(req, res, next)

    expect(createError).toHaveBeenCalledWith(400, 'File type not accepted')
    expect(next).toHaveBeenCalledWith(error)
  })

  it('should handle png file type', async () => {
    FileType.fromBuffer.mockResolvedValue({ mime: 'image/png' })
    await fileIsImage(req, res, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('should handle gif file type', async () => {
    FileType.fromBuffer.mockResolvedValue({ mime: 'image/gif' })
    await fileIsImage(req, res, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('should reject svg file type', async () => {
    FileType.fromBuffer.mockResolvedValue({ mime: 'image/svg+xml' })
    const error = new Error('File type not accepted')
    createError.mockReturnValue(error)

    await fileIsImage(req, res, next)

    expect(createError).toHaveBeenCalledWith(400, 'File type not accepted')
    expect(next).toHaveBeenCalledWith(error)
  })
})
