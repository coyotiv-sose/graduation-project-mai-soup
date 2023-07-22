const chalk = require('chalk')

// superclass for all tests
module.exports = class Test {
  pass(testName) {
    console.log(chalk.green(`✓ ${testName}`))
  }

  fail(testName, err) {
    console.log(chalk.red(`✕ ${testName}`))
    console.log(chalk.red(err))
  }
}
