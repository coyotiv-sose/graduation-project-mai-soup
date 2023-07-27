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

  const { data } = await axios.get(`${BASE_URL}/users?json=true`)
  console.log('users:')
  console.log(data)

  await axios.post(`${BASE_URL}/users/maijs/ownedShelves`, {
    name: 'mai shelf',
    latitude: 0,
    longitude: 0,
  })
}

main()
