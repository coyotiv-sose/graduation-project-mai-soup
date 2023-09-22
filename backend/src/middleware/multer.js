const multer = require('multer')
const createError = require('http-errors')

const multerMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
})

const singleFileMulter = multerMiddleware.single('file')

const singleFile = (req, res, next) => {
  // check if filesize isn't too large, throw 413 if it is
  singleFileMulter(req, res, err => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return next(createError(413, 'File too large'))
    }

    if (err) {
      return next(createError(500, err.message))
    }

    return next()
  })
}

module.exports = { singleFile }
