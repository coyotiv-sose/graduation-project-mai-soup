const UserTests = require('./models/user.test')
const BookshelfTests = require('./models/bookshelf.test')
const BookTests = require('./models/book.test')

const userTests = new UserTests()
userTests.run()

console.log('----------------')
const bookshelfTests = new BookshelfTests()
bookshelfTests.run()

console.log('----------------')
const bookTests = new BookTests()
bookTests.run()
