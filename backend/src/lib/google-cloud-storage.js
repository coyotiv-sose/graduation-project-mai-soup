const Cloud = require('@google-cloud/storage')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const serviceKey = path.join(__dirname, '../config/keys.json')
const { Storage } = Cloud

// TODO: use defauly app credentials from service in prod
// and keyfile in dev
const gcs = new Storage({
  keyFilename: serviceKey,
  projectId: process.env.GCLOUD_PROJECT_ID,
})

// TODO: different bucket for dev and prod, should probably just use env vars
const bucketName = 'prc-libraries-test'
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

const uploadImage = file =>
  new Promise((resolve, reject) => {
    const { buffer } = file

    const extension = path.extname(file.originalname).toLowerCase()
    const blob = bucket.file(`${uuidv4()}${extension}`)
    const blobStream = blob.createWriteStream({
      resumable: false,
    })
    blobStream
      .on('finish', async () => {
        const publicUrl = await getSignedReadUrl(blob.name)
        resolve({ name: blob.name, publicUrl })
      })
      .on('error', err => {
        console.error(err)
        reject(new Error('Unable to upload image, something went wrong'))
      })
      .end(buffer)
  })

module.exports = { uploadImage, getSignedReadUrl }
