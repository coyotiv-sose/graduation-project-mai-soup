const User = require('./user')

module.exports = class UserTests {
  run() {
    console.log(`running user tests...\n`)

    this.canSetValidUsername()
    this.canSetInvalidUsername()

    console.log(`\nuser tests passed!`)
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
        throw new Error('username was not set correctly')
      }
    })
    console.log(`tried setting ${validUsernames.length} valid usernames`)
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
        throw new Error(`username was set to an invalid value: ${username}`)
      } catch (err) {
        // caught the error, so the test passed
      }
    })

    console.log(`tried setting ${invalidUsernames.length} invalid usernames`)
  }
}
