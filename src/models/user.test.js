const User = require('./user')
const Bookshelf = require('./bookshelf')
const Test = require('../test.test')

module.exports = class UserTests extends Test {
  static validUsernames = ['validUsername', 'valid-username', 'valid_username']

  run() {
    this.canSetValidUsername()
    this.canSetInvalidUsername()
    this.canSetEmail()
    this.canSubscribeToShelf()
  }

  canSetValidUsername() {
    const validUsernames = [
      'aaa', // shortest valid username
      'aaaaaaaaaaaaaaaaaaaaaaaa', // longest valid username
      'validUsername', // alphanumeric
      'valid-username', // dashes
      'valid_username', // underscores
      'valid-username_123', // dashes and underscores
    ]

    validUsernames.forEach(username => {
      const user = new User({ username })
      if (user.username !== username) {
        super.fail(`failed to set valid username ${username}`)
      }
    })
    super.pass(`set ${validUsernames.length} valid usernames`)
  }

  canSetInvalidUsername() {
    const invalidUsernames = [
      'aa', // too short
      'aaaaaaaaaaaaaaaaaaaaaaaaa', // too long
      'invalidUsername!', // invalid characters
    ]

    invalidUsernames.forEach(username => {
      try {
        const user = new User({ username })
        super.fail(`set invalid username ${username}`)
      } catch (err) {
        // caught the error, so the test passed
      }
    })

    super.pass(`tried setting ${invalidUsernames.length} invalid usernames`)
  }

  canSetEmail() {
    const email = 'email@example.com'
    const user = new User({ username: UserTests.validUsernames[0], email })
    if (user.email !== email) {
      super.fail(`failed to set email ${email}`)
    }
    super.pass('set email')
  }

  canSubscribeToShelf() {
    const user = new User({ username: UserTests.validUsernames[0] })
    const user2 = new User({ username: UserTests.validUsernames[1] })
    const owner = new User({ username: UserTests.validUsernames[2] })
    const shelf = owner.createShelf({
      name: 'shelf',
      latitude: 0,
      longitude: 0,
    })

    user.subscribeToShelf(shelf)
    user2.subscribeToShelf(shelf)
    if (
      !user.subscribedBookshelves.includes(shelf) ||
      !user2.subscribedBookshelves.includes(shelf)
    ) {
      super.fail('failed to subscribe to shelf')
    }
    if (
      !shelf.subscribers.includes(user) ||
      !shelf.subscribers.includes(user2)
    ) {
      super.fail('failed to add user to shelf subscribers')
    }
    super.pass('subscribed to shelf')
  }
}
