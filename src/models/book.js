module.exports = class Book {
  title
  author
  isbn
  shelvesFoundOn = []
  imageUrl

  constructor({ title, author, isbn, imageUrl = '' }) {
    if (!title) throw new Error('book must have a title')
    if (!author) throw new Error('book must have an author')
    if (!isbn) throw new Error('book must have an isbn')

    this.title = title
    this.author = author
    this.isbn = isbn
    this.imageUrl = imageUrl
  }

  addToShelf(shelf) {
    this.shelvesFoundOn.push(shelf)
  }

  removeFromShelf(shelf) {
    const index = this.shelvesFoundOn.indexOf(shelf)
    if (index === -1) {
      throw new Error('book is not in this bookshelf')
    }

    this.shelvesFoundOn.splice(index, 1)
  }
}
