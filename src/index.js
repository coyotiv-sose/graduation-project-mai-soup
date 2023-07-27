const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function main() {
  await axios.post(`${BASE_URL}/users`, {
    username: 'maijs',
    email: 'maijs@example.com',
  })

  await axios.post(`${BASE_URL}/users`, {
    username: 'britt',
    email: 'britt@example.com',
  })

  const { data } = await axios.get(`${BASE_URL}/users`)
  console.log('users:')
  console.log(data)
}

main()
