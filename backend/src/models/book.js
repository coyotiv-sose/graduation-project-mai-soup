const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const bookSchema = new mongoose.Schema({
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
    unique: true,
  },
  imageUrl: {
    type: String,
  },
  librariesFoundIn: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Library',
      autopopulate: { maxDepth: 1 },
    },
  ],
})

class Book {
  async addToLibrary(library) {
    this.librariesFoundIn.push(library)
    await this.save()
  }

  async removeFromLibrary(library) {
    const libraryWithId = this.librariesFoundIn.find(
      l => l._id.toString() === library._id.toString()
    )

    if (!libraryWithId) {
      throw new Error('book is not in this library')
    }

    const index = this.librariesFoundIn.indexOf(libraryWithId)
    this.librariesFoundIn.splice(index, 1)
    await this.save()
  }
}

bookSchema.loadClass(Book)
bookSchema.plugin(autopopulate)
module.exports = mongoose.model('Book', bookSchema)
