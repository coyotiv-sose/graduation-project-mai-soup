const validator = require('email-validator')
const PasswordValidator = require('password-validator')
const { celebrate, Joi, Segments } = require('celebrate')

const validateLibrary = celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(5).max(40).required(),
    location: Joi.string().required(),
    file: Joi.any(), // validation done in multer
  },
})

const validateCopyUpdate = celebrate({
  [Segments.BODY]: {
    action: Joi.string().valid('borrow', 'return', 'extend', 'lose').required(),
  },
})

const passwordSchema = new PasswordValidator()
passwordSchema
  .is()
  .min(8)
  .is()
  .max(64)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .symbols()
  .has()
  .digits()

const validateNewAccount = celebrate({
  [Segments.BODY]: {
    username: Joi.string()
      .min(3)
      .max(24)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required(),
    email: Joi.string()
      .required()
      .custom((value, helper) => {
        if (!validator.validate(value)) {
          return helper.message('Invalid email')
        }
        return value
      }),
    password: Joi.string()
      .required()
      .custom((value, helper) => {
        if (!passwordSchema.validate(value)) {
          return helper.message('Invalid password')
        }
        return value
      }),
  },
})

module.exports = { validateLibrary, validateCopyUpdate, validateNewAccount }
