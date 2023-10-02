const dbConnection = require('../src/database-connection')

function sleep(ms) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = async () => {
  console.log('dropping db before tests...')
  const connection = await dbConnection
  await connection.dropDatabase()
  // sleep for 5s since apparently otherwise the dropping might still be running
  await sleep(5000)
}
