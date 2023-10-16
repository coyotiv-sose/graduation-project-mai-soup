const BookCopy = require('../models/book-copy')
const BookInfo = require('../models/book-info')

// TODO: only owner can change name

// TODO: compare ids with .equals() instead of casting to string
class LibraryService {
  async setOwner(newOwner) {
    // TODO: check that owner isn't suspended

    // subscribe new owner if owner has changed or document is new
    if (this.isModified('owner') || this.isNew) {
      if (!newOwner.memberships?.includes(this)) {
        // subscribe new owner
        this.members.push(newOwner)
      }
    }
  }

  async addMember(user) {
    const memberIds = this.members.map(member => member._id.toString())

    if (memberIds.includes(user._id.toString())) return

    this.members.push(user)
    await this.save()
  }

  async removeMember(user) {
    const userId = user._id.toString()
    const memberIds = this.members.map(member => member._id.toString())

    if (!memberIds.includes(userId)) {
      throw new Error('user is not a member of this library')
    }

    const index = memberIds.indexOf(userId)
    this.members.splice(index, 1)

    await this.save()
  }

  async addBook(bookInfo) {
    const bookCopy = await BookCopy.create({ bookInfo, library: this })

    await bookInfo.addToLibrary(this)
    this.books.push(bookCopy)
    await this.save()
    return bookCopy
  }

  async removeBookCopy(bookCopy) {
    const index = this.books.findIndex(
      b => b._id.toString() === bookCopy._id.toString()
    )
    if (index === -1) {
      throw new Error('copy is not in this library')
    }
    const copiesLeft = this.books.filter(
      b => b.bookInfo.openLibraryId === bookCopy.bookInfo.openLibraryId
    )

    if (copiesLeft.length === 1) {
      const bookInfo = await BookInfo.findById(bookCopy.bookInfo._id)
      await bookInfo.removeFromLibrary(this)
    }

    await BookCopy.findByIdAndDelete(bookCopy._id)
    this.books.splice(index, 1)
    await this.save()
  }
}

module.exports = LibraryService
