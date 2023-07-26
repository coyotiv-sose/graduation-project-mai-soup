const Test = require('../test.test')
const Book = require('./book')
const Bookshelf = require('./bookshelf')
const User = require('./user')

module.exports = class BookTests extends Test {
  run() {
    this.canCreateValidBook()
    this.canCreateInvalidBook()
    this.storesShelves()
    this.removesShelves()
  }

  canCreateValidBook() {
    let failed = false
    const validBooks = [
      {
        // all fields
        title: 'valid title',
        author: 'valid author',
        isbn: '1234567890123',
        imageUrl: 'https://example.com/image.jpg',
      },
      {
        // no image
        title: 'valid title',
        author: 'valid author',
        isbn: '1234567890',
      },
    ]

    validBooks.forEach(book => {
      const newBook = new Book(book)
      if (!(newBook instanceof Book)) {
        super.fail('failed to create valid book')
        failed = true
      }
      if (newBook.title !== book.title) {
        super.fail('failed to set book title')
        failed = true
      }
      if (newBook.author !== book.author) {
        super.fail('failed to set book author')
        failed = true
      }
      if (newBook.isbn !== book.isbn) {
        super.fail('failed to set book isbn')
        failed = true
      }
      if (book.imageUrl) {
        if (newBook.imageUrl !== book.imageUrl) {
          super.fail('failed to set book imageUrl')
          failed = true
        }
      } else {
        if (newBook.imageUrl !== '') {
          super.fail('failed to set book imageUrl')
          failed = true
        }
      }
      if (newBook.shelves.length !== 0) {
        super.fail('initial bookshelves not empty')
        failed = true
      }
    })
    if (!failed) super.pass(`created ${validBooks.length} valid books`)
  }

  canCreateInvalidBook() {
    let failed = false
    const invalidBooks = [
      {
        // no title
        author: 'valid author',
        isbn: '1234567890123',
        imageUrl: 'https://example.com/image.jpg',
      },
      {
        // no author
        title: 'valid title',
        isbn: '1234567890123',
        imageUrl: 'https://example.com/image.jpg',
      },
      {
        // no isbn
        title: 'valid title',
        author: 'valid author',
        imageUrl: 'https://example.com/image.jpg',
      },
    ]

    invalidBooks.forEach(book => {
      try {
        const newBook = new Book(book)
        super.fail('created invalid book')
        console.table(newBook)
        failed = true
      } catch (e) {
        // expected
      }
    })

    if (!failed)
      super.pass(`attempted to create ${invalidBooks.length} invalid books`)
  }

  storesShelves() {
    let failed = false
    const book = new Book({
      title: 'valid title',
      author: 'valid author',
      isbn: '1234567890123',
    })

    const owner = new User({
      username: 'validusername',
      email: 'email@example.com',
    })
    const shelf1 = new Bookshelf({
      name: 'shelf1',
      owner,
      latitude: 0,
      longitude: 0,
    })
    const shelf2 = new Bookshelf({
      name: 'shelf2',
      owner,
      latitude: 0,
      longitude: 0,
    })

    shelf1.addBook(book)
    if (book.shelves.length !== 1 || !book.shelves.includes(shelf1)) {
      super.fail('failed to add one shelf to book')
      failed = true
    }

    shelf2.addBook(book)
    if (book.shelves.length !== 2 || !book.shelves.includes(shelf2)) {
      super.fail('failed to add additional shelf to book')
      failed = true
    }

    if (!failed) super.pass('stored shelves')
  }

  removesShelves() {
    let failed = false
    const book = new Book({
      title: 'valid title',
      author: 'valid author',
      isbn: '1234567890123',
    })

    const owner = new User({
      username: 'validusername',
      email: 'email@example.com',
    })
    const shelf1 = new Bookshelf({
      name: 'shelf1',
      owner,
      latitude: 0,
      longitude: 0,
    })
    const shelf2 = new Bookshelf({
      name: 'shelf2',
      owner,
      latitude: 0,
      longitude: 0,
    })

    shelf1.addBook(book)
    shelf2.addBook(book)

    shelf1.removeBook(book)
    if (book.shelves.length !== 1 || book.shelves.includes(shelf1)) {
      super.fail('failed to remove first shelf from book')
      failed = true
    }

    shelf1.addBook(book)
    shelf2.removeBook(book)
    if (book.shelves.length !== 1 || book.shelves.includes(shelf2)) {
      super.fail('failed to remove second shelf from book')
      failed = true
    }

    shelf2.addBook(book)
    shelf1.removeBook(book)
    shelf2.removeBook(book)
    if (book.shelves.length !== 0) {
      super.fail('failed to remove all shelves from book')
      failed = true
    }

    if (!failed) super.pass('removed shelves')
  }
}
