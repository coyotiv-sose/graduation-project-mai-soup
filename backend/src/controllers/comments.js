const createError = require('http-errors')
const catchAsync = require('../utils/catch-async')
const Comment = require('../models/comment')
const User = require('../models/user')

module.exports.getLibraryComments = catchAsync(async (req, res) => {
  const { id: libraryId } = req.params

  const comments = await Comment.find({ library: libraryId })
  return res.send(comments)
})

module.exports.getSingleComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params
  const comment = await Comment.findById(commentId)
  // TODO: refactor into middleware
  if (!comment) {
    return next(createError(404, 'Comment not found'))
  }
  return res.send(comment)
})

module.exports.createComment = catchAsync(async (req, res) => {
  const { id: libraryId } = req.params
  const { content } = req.body

  const author = await User.findById(req.user._id)
  const comment = await author.createComment(libraryId, content)

  return res.status(201).send(comment)
})

module.exports.deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params

  const comment = await Comment.findById(commentId)
  // TODO: refactor into middleware
  if (!comment) {
    return next(createError(404, 'Comment not found'))
  }

  const author = await User.findById(req.user._id)
  await author.deleteComment(commentId)

  return res.status(204).send()
})
