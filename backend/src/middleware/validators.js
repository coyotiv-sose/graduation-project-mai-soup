const { celebrate, Joi, Segments } = require('celebrate')

const validateLibrary = celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(5).max(40).required(),
    location: Joi.string().required(),
  },
})

const validateCopyUpdate = celebrate({
  [Segments.BODY]: {
    action: Joi.string().valid('borrow', 'return', 'extend', 'lose').required(),
  },
})

module.exports = { validateLibrary, validateCopyUpdate }
