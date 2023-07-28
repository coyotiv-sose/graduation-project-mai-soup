const Bookshelf = require('./bookshelf')
const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 24,
    match: /^[a-zA-Z0-9_-]+$/,
    // TODO: make uniqueness case-insensitive
    // unique: true,
  },
  email: {
    // TODO: validate email
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  subscribedBookshelves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookshelf',
      autopopulate: true,
    },
  ],
})

class User {
  async createShelf({ name, latitude, longitude }) {
    const newShelf = await Bookshelf.create({
      name,
      owner: this,
      latitude,
      longitude,
    })

    this.subscribedBookshelves.push(newShelf)
    await this.save()
    await newShelf.save()
    return newShelf
  }

  async subscribeToShelf(shelf) {
    this.subscribedBookshelves.push(shelf)
    await this.save()
    await shelf.addSubscriber(this)
  }

  unsubscribeFromShelf(shelf) {
    const shelfIndex = this.subscribedBookshelves.indexOf(shelf)
    if (shelfIndex === -1) {
      throw new Error('user is not subscribed to this bookshelf')
    }
    this.subscribedBookshelves.splice(shelfIndex, 1)
    shelf.removeSubscriber(this)
  }
}

userSchema.loadClass(User)
userSchema.plugin(autopopulate)

module.exports = mongoose.model('User', userSchema)
