const Test = require('../test.test')
const Book = require('./book')

module.exports = class BookTests extends Test {
  run() {
    this.canCreateValidBook()
    this.canCreateInvalidBook()
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
}
