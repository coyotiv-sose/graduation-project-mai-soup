const FileType = require('file-type')
const createError = require('http-errors')
const fileIsImage = require('../../src/middleware/fileIsImage')

jest.mock('file-type')

describe('fileIsImage middleware', () => {
  let req
  let res
  let next
  const TEST_BUFFER = Buffer.from('actual image data')

  beforeEach(() => {
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

    await fileIsImage(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(createError.BadRequest))
    expect(next.mock.calls[0][0].message).toBe('File type not accepted')
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

    await fileIsImage(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(createError.BadRequest))
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: 'File type not accepted',
      })
    )
  })
})
