// eslint-disable-next-line import/no-extraneous-dependencies
const generator = require('generate-password')

const generatePassword = () =>
  generator.generate({
    length: 10,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    strict: true,
  })

module.exports = generatePassword
