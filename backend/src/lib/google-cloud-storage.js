const Cloud = require('@google-cloud/storage')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const serviceKey = path.join(__dirname, '../config/keys.json')
const { Storage } = Cloud

// use default storage in production, config from key in dev
const gcs =
  process.env.NODE_ENV === 'production'
    ? new Storage()
    : new Storage({
        keyFilename: serviceKey,
        projectId: process.env.GCLOUD_PROJECT_ID,
      })

const bucketName = process.env.GCLOUD_STORAGE_BUCKET
const bucket = gcs.bucket(bucketName)

const getSignedReadUrl = async filename => {
  // These options will allow temporary read access to the file
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  }

  // Get a v4 signed URL for reading the file
  const [url] = await gcs
    .bucket(bucketName)
    .file(filename)
    .getSignedUrl(options)

  return url
}

const uploadImage = async file => {
  const { buffer } = file
  const extension = path.extname(file.originalname).toLowerCase()
  const blobName = `${uuidv4()}${extension}`
  const blob = bucket.file(blobName)
  const blobStream = blob.createWriteStream({
    resumable: false,
  })

  // try uploading the file
  try {
    await new Promise((resolve, reject) => {
      blobStream
        .on('finish', resolve)
        .on('error', err => {
          console.error(err)
          reject(new Error('Unable to upload image, something went wrong'))
        })
        .end(buffer)
    })

    const publicUrl = await getSignedReadUrl(blob.name)
    return { name: blob.name, publicUrl }
  } catch (err) {
    console.error(err)
    throw new Error('Unable to upload image, something went wrong')
  }
}

const deleteImage = async filename => {
  const blob = bucket.file(filename)
  try {
    await blob.delete()
    return { name: blob.name }
  } catch (err) {
    console.error(err)
    throw new Error('Unable to delete image, something went wrong')
  }
}

module.exports = { uploadImage, deleteImage, getSignedReadUrl }
