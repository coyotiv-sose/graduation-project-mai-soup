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

  axios
    .post(`${BASE_URL}/books?json=true`, {
      title: 'The Book Thief',
      author: 'Markus Zusak',
      isbn: '9780375842207',
    })
    .then(res => console.log(`book thief: ${res.data}`))

  axios
    .post(`${BASE_URL}/books?json=true`, {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '9780062316097',
    })
    .then(res => console.log(`sapiens: ${res.data}`))
}

main().catch(err => console.log(err.data.message ? err.data.message : err))
