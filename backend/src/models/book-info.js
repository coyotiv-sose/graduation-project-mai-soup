const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const bookInfoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authors: [
    {
      type: String,
      required: true,
    },
  ],
  openLibraryId: {
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

class BookInfo {
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

bookInfoSchema.loadClass(BookInfo)
bookInfoSchema.plugin(autopopulate)
module.exports = mongoose.model('BookInfo', bookInfoSchema)
