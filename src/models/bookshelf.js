const Book = require('./book')

module.exports = class Bookshelf {
  name
  owner
  latitude
  longitude
  subscribers = []
  books = []

  constructor({ name, owner, latitude, longitude }) {
    this.setName(name)
    this.setOwner(owner)
    this.latitude = latitude
    this.longitude = longitude
  }

  setOwner(newOwner) {
    if (!newOwner) {
      throw new Error('bookshelf must have an owner')
    }

    // TODO: check that owner isn't suspended

    // subscribe new owner
    this.owner = newOwner
    this.owner.subscribeToShelf(this)
  }
  setName(newName) {
    // TODO: only owner can change name
    // name requirements:
    // string 5-40 chars in length
    // alphanumeric, spaces, dashes, underscores
    if (typeof newName !== 'string') {
      throw new Error('name must be a string')
    }
    if (newName.length < 5 || newName.length > 40) {
      throw new Error('name must be 5-40 characters in length')
    }
    if (!newName.match(/^[a-zA-Z0-9 _-]+$/)) {
      throw new Error(
        'name must only contain alphanumeric, spaces, dashes, and underscores'
      )
    }
    this.name = newName
  }

  get location() {
    return [this.longitude, this.latitude]
  }

  addSubscriber(user) {
    if (this.subscribers.includes(user)) {
      throw new Error('user is already subscribed to this bookshelf')
    }

    this.subscribers.push(user)
  }

  removeSubscriber(user) {
    const index = this.subscribers.indexOf(user)
    if (index === -1) {
      throw new Error('user is not subscribed to this bookshelf')
    }

    this.subscribers.splice(index, 1)
  }

  addBook(book) {
    if (!(book instanceof Book)) {
      throw new Error('book must be an instance of Book')
    }

    if (!this.books.includes(book)) {
      book.addToShelf(this)
    }
    this.books.push(book)
  }

  removeBook(book) {
    const index = this.books.indexOf(book)
    if (index === -1) {
      throw new Error('book is not in this bookshelf')
    }
    const copies = this.books.filter(b => b.isbn === book.isbn)
    if (copies.length == 1) {
      book.removeFromShelf(this)
    }
    this.books.splice(index, 1)
  }

  static create({ name, owner, latitude, longitude }) {
    const newBookshelf = new Bookshelf({
      name,
      owner,
      latitude,
      longitude,
    })

    this.list.push(newBookshelf)

    return newBookshelf
  }

  static list = []
}
