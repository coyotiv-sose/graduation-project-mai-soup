const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    autopopulate: { maxDepth: 1 },
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 1 },
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

commentSchema.plugin(autopopulate)
module.exports = mongoose.model('Comment', commentSchema)
