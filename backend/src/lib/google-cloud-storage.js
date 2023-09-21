const Cloud = require('@google-cloud/storage')
const path = require('path')

const serviceKey = path.join(__dirname, '../config/keys.json')
const { Storage } = Cloud

// TODO: use defauly app credentials from service in prod
// and keyfile in dev
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: process.env.GCLOUD_PROJECT_ID,
})

module.exports = storage
