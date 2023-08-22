const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const bookCopySchema = new mongoose.Schema({
  bookInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookInfo',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  status: {
    // status can be one of: available, borrowed, lost (if destroyed, remove from db)
    type: String,
    required: true,
    enum: ['available', 'borrowed', 'lost'],
    default: 'available',
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 1 },
  },
  returnDate: {
    type: Date,
  },
  // TODO: add history of borrows? should this be kept under a user?
  // how to be sure that the correct copy is updated if there are several? difficult.
})

class BookCopy {
  async borrow(user) {
    if (this.status !== 'available') {
      throw new Error('book is not available')
    }

    this.status = 'borrowed'
    this.borrower = user
    this.returnDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    await this.save()
  }

  async return() {
    if (this.status !== 'borrowed') {
      throw new Error('book is not borrowed')
    }

    this.status = 'available'
    this.borrower = null
    this.returnDate = null
    await this.save()
  }

  async extend() {
    if (this.status !== 'borrowed') {
      throw new Error('book is not borrowed')
    }

    // if the book's return date is more than 7 days from now, don't extend
    if (this.returnDate.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000) {
      throw new Error('return date is too far in the future')
    }

    this.returnDate = new Date(
      this.returnDate.getTime() + 7 * 24 * 60 * 60 * 1000
    ) // 7 days from now
    await this.save()
  }

  async lose() {
    this.status = 'lost'
    this.borrower = null
    this.returnDate = null
    await this.save()
  }
}

bookCopySchema.loadClass(BookCopy)
bookCopySchema.plugin(autopopulate)

module.exports = mongoose.model('BookCopy', bookCopySchema)
