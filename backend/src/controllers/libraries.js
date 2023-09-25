const createError = require('http-errors')
const { uploadImage, deleteImage } = require('../lib/google-cloud-storage')

module.exports.uploadImage = async (req, res, next) => {
  try {
    const myFile = req.file
    const { publicUrl, name } = await uploadImage(myFile)
    return res.status(200).json({
      message: 'Upload was successful',
      data: {
        publicUrl,
        name,
      },
    })
  } catch (error) {
    return next(createError(500, error.message))
  }
}

module.exports.deleteImage = async (req, res, next) => {
  const { filename } = req.params
  try {
    await deleteImage(filename)
    return res.status(200).json({
      message: 'File deleted successfully',
    })
  } catch (error) {
    return next(createError(500, error.message))
  }
}
