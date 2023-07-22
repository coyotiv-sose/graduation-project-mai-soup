const User = require('./user')
const Test = require('../test.test')

module.exports = class UserTests extends Test {
  validUsername = 'validUsername'

  run() {
    this.canSetValidUsername()
    this.canSetInvalidUsername()
    this.canSetEmail()
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
    const user = new User({ username: this.validUsername, email })
    if (user.email !== email) {
      super.fail(`failed to set email ${email}`)
    }
    super.pass('set email')
  }
}
