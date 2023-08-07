const chalk = require('chalk')

// superclass for all tests
module.exports = class Test {
  pass(msg) {
    console.log(chalk.green(`✓ ${msg}`))
  }

  fail(msg) {
    console.log(chalk.red(`✕ ${msg}`))
  }
}
