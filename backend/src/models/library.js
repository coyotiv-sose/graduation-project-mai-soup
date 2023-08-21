const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const BookCopy = require('./book-copy')

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 40,
    match: /^[a-zA-Z0-9 _-]+$/,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 1 },
    },
  ],
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookCopy',
      autopopulate: { maxDepth: 1 },
    },
  ],
})

// eslint-disable-next-line func-names
librarySchema.pre('save', async function (next) {
  await this.setOwner(this.owner)
  next()
})

// TODO: only owner can change name
class Library {
  async setOwner(newOwner) {
    // TODO: check that owner isn't suspended

    // subscribe new owner if owner has changed or document is new
    if (this.isModified('owner') || this.isNew) {
      if (!newOwner.memberships.includes(this)) {
        // subscribe new owner
        this.members.push(newOwner)
      }
    }
  }

  get location() {
    return [this.longitude, this.latitude]
  }

  async addMember(user) {
    if (this.members.includes(user)) return

    this.members.push(user)
    await this.save()
  }

  async removeMember(user) {
    const userId = user._id.toString()
    const memberIds = this.members.map(member => member._id.toString())

    if (!memberIds.includes(userId)) {
      throw new Error('user is not a member of this library')
    }

    const index = memberIds.indexOf(userId)
    this.members.splice(index, 1)

    await this.save()
  }

  async addBook(bookInfo) {
    const bookCopy = await BookCopy.create({ bookInfo, library: this })

    await bookInfo.addToLibrary(this)
    this.books.push(bookCopy)
    await this.save()
  }

  async removeBookCopy(bookCopy) {
    const index = this.books.findIndex(
      b => b._id.toString() === bookCopy._id.toString()
    )
    if (index === -1) {
      throw new Error('copy is not in this library')
    }
    await BookCopy.findByIdAndDelete(bookCopy._id)
    this.books.splice(index, 1)
    await this.save()
  }
}

librarySchema.loadClass(Library)
librarySchema.plugin(autopopulate)

module.exports = mongoose.model('Library', librarySchema)
