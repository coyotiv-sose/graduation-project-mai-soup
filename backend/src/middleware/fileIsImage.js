const createError = require('http-errors')
const FileType = require('file-type')
const catchAsync = require('../utils/catch-async')

module.exports = catchAsync(async (req, res, next) => {
  if (!req.file) return next()

  const whitelist = ['image/jpeg', 'image/png', 'image/gif']

  const fileMeta = await FileType.fromBuffer(req.file.buffer)

  if (!whitelist.includes(fileMeta.mime)) {
    return next(createError(400, 'File type not accepted'))
  }

  return next()
})
