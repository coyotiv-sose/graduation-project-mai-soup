const mongoose = require('mongoose')

const conn = mongoose.connect(process.env.MONGO_URI)

conn.then(() => console.log('connected to mongo'))

module.exports = conn
