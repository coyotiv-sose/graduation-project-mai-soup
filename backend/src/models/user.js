const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const passportLocalMongoose = require('passport-local-mongoose')
const UserService = require('../services/user')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 24,
    match: /^[a-zA-Z0-9_-]+$/, // alphanumeric, underscore, and dash characters only
    //   // TODO: make uniqueness case-insensitive
    unique: true,
  },
  email: {
    // TODO: validate email
    type: String,
    required: true,
    unique: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  memberships: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Library',
      autopopulate: { maxDepth: 2 },
    },
  ],
  ownedLibraries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Library',
      autopopulate: { maxDepth: 2 },
    },
  ],
  loans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookCopy',
      autopopulate: { maxDepth: 2 },
    },
  ],
})

userSchema.loadClass(UserService)
userSchema.plugin(autopopulate)
userSchema.plugin(passportLocalMongoose, { usernameQueryFields: ['email'] })

module.exports = mongoose.model('User', userSchema)
