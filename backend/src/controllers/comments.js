const catchAsync = require('../utils/catch-async')
const Comment = require('../models/comment')
const createError = require('../utils/create-error')

module.exports.getLibraryComments = catchAsync(async (req, res, next) => {
  const { libraryId } = req.params

  const comments = await Comment.find({ library: libraryId })
  return res.send(comments)
})

module.exports.getSingleComment = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const comment = await Comment.findById(id)
  if (!comment) {
    return next(createError(404, 'Comment not found'))
  }
  return res.send(comment)
})

module.exports.postComment = catchAsync(async (req, res, next) => {
  const { libraryId } = req.params
  const { content } = req.body

  const comment = await req.user.createComment(libraryId, content)
  return res.status(201).send(comment)
})

module.exports.deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params

  await req.user.deleteComment(id)
  return res.status(204).send()
})
