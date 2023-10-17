const createError = require('http-errors')

module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) return next(createError(401, 'Unauthorized'))

  return next()
}
