const Library = require('../models/library')
const Book = require('../models/book')
const Comment = require('../models/comment')

class UserService {
  async createLibrary({ name, location, coordinates, image }) {
    const newLibrary = await Library.create({
      name,
      owner: this,
      location,
      geometry: {
        type: 'Point',
        coordinates,
      },
      image,
    })

    this.ownedLibraries.push(newLibrary)
    await this.save()
    await this.joinLibrary(newLibrary)

    return newLibrary
  }

  async deleteLibrary(libraryId) {
    const ownedLibraryIds = this.ownedLibraries.map(l => l._id.toString())

    if (!ownedLibraryIds.includes(libraryId)) {
      throw new Error('user is not owner of this library')
    }

    const libraryIndex = ownedLibraryIds.indexOf(libraryId)
    this.ownedLibraries.splice(libraryIndex, 1)
    await this.save()

    await Library.findByIdAndDelete(libraryId)
  }

  async joinLibrary(library) {
    if (
      this.memberships.find(m => m._id.toString() === library._id.toString())
    ) {
      throw new Error('user is already a member of this library')
    }

    this.memberships.push(library)
    await this.save()
    await library.addMember(this)
  }

  async leaveLibrary(library) {
    const libraryId = library._id.toString()
    const membershipIds = this.memberships.map(m => m._id.toString())

    if (!membershipIds.includes(libraryId)) {
      throw new Error('user is not member of this library')
    }

    const libraryIndex = membershipIds.indexOf(libraryId)
    this.memberships.splice(libraryIndex, 1)

    await this.save()
    await library.removeMember(this)
  }

  async borrowBook(book) {
    if (book.status !== 'available') {
      throw new Error('book copy is not available')
    }

    await book.borrow(this)
    this.loans.push(book)
    await this.save()
  }

  async returnBook(book) {
    const bookObj = await Book.findById(book._id)

    if (
      bookObj.status !== 'borrowed' ||
      bookObj.borrower._id.toString() !== this._id.toString()
    ) {
      throw new Error('book is not borrowed by this user')
    }

    await bookObj.return()
    const bookId = bookObj._id.toString()
    // filter out book from loans
    this.loans = this.loans.filter(loan => loan._id.toString() !== bookId)
    await this.save()
  }

  async createComment(libraryId, content) {
    const library = await Library.findById(libraryId)
    if (!library) {
      throw new Error('library does not exist')
    }

    const newComment = await Comment.create({
      content,
      library,
      author: this,
    })

    return newComment
  }

  async deleteComment(commentId) {
    const comment = await Comment.findById(commentId)
    if (!comment) {
      throw new Error('comment does not exist')
    }

    if (!comment.author._id.equals(this._id)) {
      throw new Error('user is not the author of this comment')
    }

    await Comment.findByIdAndDelete(commentId)
  }
}

module.exports = UserService
