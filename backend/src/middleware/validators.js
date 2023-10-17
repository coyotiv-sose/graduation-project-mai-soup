const { celebrate, Joi, Segments } = require('celebrate')

const validateLibrary = celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(5).max(40).required(),
    location: Joi.string().required(),
  },
})

module.exports = { validateLibrary }
