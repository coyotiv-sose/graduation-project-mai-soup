const Library = require('../models/library')
const BookCopy = require('../models/book-copy')

class UserService {
  async createLibrary({ name, location, latitude, longitude }) {
    const newLibrary = await Library.create({
      name,
      owner: this,
      location,
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    })

    this.memberships.push(newLibrary)
    await this.save()
    await newLibrary.save()
    return newLibrary
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

  async borrowBook(bookCopy) {
    if (bookCopy.status !== 'available') {
      throw new Error('book copy is not available')
    }

    await bookCopy.borrow(this)
    this.loans.push(bookCopy)
    await this.save()
  }

  async returnBook(bookCopy) {
    const bookCopyObj = await BookCopy.findById(bookCopy._id)

    if (
      bookCopyObj.status !== 'borrowed' ||
      bookCopyObj.borrower._id.toString() !== this._id.toString()
    ) {
      throw new Error('book copy is not borrowed by this user')
    }

    await bookCopyObj.return()
    const bookCopyId = bookCopyObj._id.toString()
    // filter out bookCopy from loans
    this.loans = this.loans.filter(loan => loan._id.toString() !== bookCopyId)
    await this.save()
  }
}

module.exports = UserService
