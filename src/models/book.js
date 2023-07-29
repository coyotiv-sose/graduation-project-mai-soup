const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const bookshelfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  shelvesFoundOn: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookshelf',
    },
  ],
})

class Book {
  async addToShelf(shelf) {
    this.shelvesFoundOn.push(shelf)
    await this.save()
  }

  removeFromShelf(shelf) {
    const index = this.shelvesFoundOn.indexOf(shelf)
    if (index === -1) {
      throw new Error('book is not in this bookshelf')
    }

    this.shelvesFoundOn.splice(index, 1)
    this.save()
  }
}

bookshelfSchema.loadClass(Book)
bookshelfSchema.plugin(autopopulate)
module.exports = mongoose.model('Book', bookshelfSchema)
