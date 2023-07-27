const Test = require('../test.test')
const Bookshelf = require('./bookshelf')
const User = require('./user')
const UserTests = require('./user.test')

module.exports = class BookshelfTests extends Test {
  run() {
    this.canCreateValidBookshelf()
    this.canCreateInvalidBookshelf()
    this.canChangeOwner()
  }

  canCreateValidBookshelf() {
    let failed = false
    const user = new User({
      username: UserTests.validUsernames[0],
      email: 'email@example.com',
    })
    const bookshelf = user.createShelf({
      name: 'valid name',
      latitude: 0,
      longitude: 0,
    })
    if (!(bookshelf instanceof Bookshelf)) {
      super.fail('failed to create valid bookshelf')
      failed = true
    }
    if (bookshelf.owner !== user) {
      super.fail('failed to set bookshelf owner')
      console.table(bookshelf)
      console.table(user)
      failed = true
    }
    if (bookshelf.name !== 'valid name') {
      super.fail('failed to set bookshelf name')
      failed = true
    }
    if (bookshelf.location[0] !== 0 || bookshelf.location[1] !== 0) {
      super.fail('failed to set bookshelf location')
      failed = true
    }
    if (!failed) super.pass('created valid bookshelf')
  }

  canCreateInvalidBookshelf() {
    let failed = false
    const user = new User({
      username: UserTests.validUsernames[0],
      email: 'email@example.com',
    })
    const invalidBookshelves = [
      {
        name: 'a', // too short
        latitude: 0,
        longitude: 0,
      },
      {
        name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // too long
        latitude: 0,
        longitude: 0,
      },
      {
        name: 'invalid name!', // invalid characters
        latitude: 0,
        longitude: 0,
      },
    ]
    invalidBookshelves.forEach(bookshelf => {
      try {
        user.createShelf(bookshelf)
        super.fail('created invalid bookshelf ' + JSON.stringify(bookshelf))
        failed = true
      } catch (err) {
        // caught the error, so the test passed
      }
    })
    if (!failed) super.pass('tried creating invalid bookshelves')
  }

  canChangeOwner() {
    let failed = false
    const user = new User({
      username: UserTests.validUsernames[0],
      email: 'email@example.com',
    })
    const bookshelf = user.createShelf({
      name: 'valid name',
      latitude: 0,
      longitude: 0,
    })
    const newOwner = new User({
      username: UserTests.validUsernames[1],
      email: 'email@email.com',
    })
    bookshelf.setOwner(newOwner)
    if (bookshelf.owner !== newOwner) {
      super.fail('failed to change owner')
      failed = true
    }
    if (newOwner.subscribedBookshelves[0] !== bookshelf) {
      super.fail('failed to subscribe new owner to bookshelf')
      failed = true
    }
    if (!user.subscribedBookshelves.includes(bookshelf)) {
      super.fail('failed to keep old owner subscribed to bookshelf')
      failed = true
    }
    if (!failed) super.pass('changed owner')
  }
}
