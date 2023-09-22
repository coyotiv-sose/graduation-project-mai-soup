const multer = require('multer')

const multerMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
})

const singleFile = multerMiddleware.single('file')

module.exports = { singleFile }
