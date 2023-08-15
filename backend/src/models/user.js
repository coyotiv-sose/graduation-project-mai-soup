const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const passportLocalMongoose = require('passport-local-mongoose')
const Library = require('./library')

const userSchema = new mongoose.Schema({
  // username: {
  //   type: String,
  //   required: true,
  //   minlength: 3,
  //   maxlength: 24,
  //   match: /^[a-zA-Z0-9_-]+$/,
  //   // TODO: make uniqueness case-insensitive
  //   unique: true,
  // },
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
})

class User {
  async createLibrary({ name, latitude, longitude }) {
    const newLibrary = await Library.create({
      name,
      owner: this,
      latitude,
      longitude,
    })

    this.memberships.push(newLibrary)
    await this.save()
    await newLibrary.save()
    return newLibrary
  }

  async joinLibrary(library) {
    this.memberships.push(library)
    await this.save()
    await library.addSubscriber(this)
  }

  leaveLibrary(library) {
    const libraryIndex = this.memberships.indexOf(library)
    if (libraryIndex === -1) {
      throw new Error('user is not member of this library')
    }
    this.memberships.splice(libraryIndex, 1)
    library.removeMember(this)
  }
}

userSchema.loadClass(User)
userSchema.plugin(autopopulate)
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)
