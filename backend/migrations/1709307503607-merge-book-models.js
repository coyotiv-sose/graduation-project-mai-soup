'use strict'

const { MongoClient } = require('mongodb')
const url = process.env.MONGO_URI

module.exports.up = async next => {
  let client

  // TODO: sample code, replace with actual code
  // try {
  //   client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  //   const db = await client.db();
  //   const results = await db.collection('users').find({ lastName: { $exists: false } }).toArray();

  //   if (results.length === 0) {
  //     return next('All docs have lastName');
  //   }

  //   const bulkOperations = results.map(result => {
  //     if (result.name) {
  //       const [firstName, lastName] = result.name.split(' ');
  //       result.firstName = firstName;
  //       result.lastName = lastName;
  //     }
  //     return { updateOne: { filter: { _id: result._id }, update: { $set: result } } };
  //   });

  //   await db.collection('users').bulkWrite(bulkOperations);
  //   await client.close();
  //   return next();
  // } catch (err) {
  //   console.error('Error:', err);
  //   return next(err);
  // }
}

module.exports.down = function (next) {
  next()
}
