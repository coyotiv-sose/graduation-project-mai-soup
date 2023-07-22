const User = require('./user')

module.exports = class Bookshelf {
  #name
  #owner
  #latitude
  #longitude

  constructor({ name, owner, latitude, longitude }) {
    this.name = name
    this.owner = owner
    this.#latitude = latitude
    this.#longitude = longitude
  }

  set owner(newOwner) {
    if (!newOwner) {
      throw new Error('bookshelf must have an owner')
    }
    if (!(newOwner instanceof User)) {
      throw new Error('bookshelf owner must be a User')
    }

    // TODO: check that owner isn't suspended

    this.#owner = newOwner
    this.#owner.subscribeToShelf(this)
  }

  set name(newName) {
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
    this.#name = newName
  }

  get info() {
    return `${this.#owner.username}'s bookshelf ${this.#name}`
  }

  get location() {
    return [this.#longitude, this.#latitude]
  }
}
