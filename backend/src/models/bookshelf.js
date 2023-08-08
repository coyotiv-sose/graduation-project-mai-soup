const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const bookshelfSchema = new mongoose.Schema({
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
    autopopulate: true,
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
  subscribers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 2 },
    },
  ],
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      autopopulate: { maxDepth: 2 },
    },
  ],
})

bookshelfSchema.pre('save', async function (next) {
  await this.setOwner(this.owner)
  next()
})

// TODO: only owner can change name
class Bookshelf {
  async setOwner(newOwner) {
    // TODO: check that owner isn't suspended

    // subscribe new owner if owner has changed or document is new
    if (this.isModified('owner') || this.isNew) {
      if (!newOwner.subscribedBookshelves.includes(this)) {
        // subscribe new owner
        this.subscribers.push(newOwner)
      }
    }
  }

  get location() {
    return [this.longitude, this.latitude]
  }

  async addSubscriber(user) {
    if (this.subscribers.includes(user)) return

    this.subscribers.push(user)
    await this.save()
  }

  removeSubscriber(user) {
    const index = this.subscribers.indexOf(user)
    if (index === -1) {
      throw new Error('user is not subscribed to this bookshelf')
    }

    this.subscribers.splice(index, 1)
  }

  async addBook(book) {
    if (!this.books.includes(book)) {
      await book.addToShelf(this)
    }
    this.books.push(book)
    await this.save()
  }

  removeBook(book) {
    const index = this.books.indexOf(book)
    if (index === -1) {
      throw new Error('book is not in this bookshelf')
    }
    const copies = this.books.filter(b => b.isbn === book.isbn)
    if (copies.length === 1) {
      book.removeFromShelf(this)
    }
    this.books.splice(index, 1)
  }
}

bookshelfSchema.loadClass(Bookshelf)
bookshelfSchema.plugin(autopopulate)

module.exports = mongoose.model('Bookshelf', bookshelfSchema)
