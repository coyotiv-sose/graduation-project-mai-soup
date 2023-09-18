const createError = require('http-errors')

module.exports = (req, res, next) => {
  if (!req.user) return next(createError(401, 'Unauthorized'))

  return next()
}
