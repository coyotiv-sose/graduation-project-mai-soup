const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const BookInfoService = require('../services/book-info')

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

bookInfoSchema.loadClass(BookInfoService)
bookInfoSchema.plugin(autopopulate)
module.exports = mongoose.model('BookInfo', bookInfoSchema)
