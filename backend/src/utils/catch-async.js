// wraps an express handler in try/catch block and calls next(error)
// if anything is caught, therefore minimising the need to write try/catch blocks
const catchAsync = fn => (req, res, next) => {
  fn(req, res, next).catch(next)
}

module.exports = catchAsync
