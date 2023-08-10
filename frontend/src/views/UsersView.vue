<script>
import axios from 'axios'

export default {
  data() {
    return {
      users: [],
      username: '',
      email: ''
    }
  },
  methods: {
    async submitForm() {
      try {
        const { data: userData } = await axios.post('http://localhost:3000/users', {
          username: this.username,
          email: this.email
        })

        // clear the input fields - DOES NOT WORK
        this.username = ''
        this.email = ''

        this.users.push(userData)
      } catch (error) {
        // TODO: handle error
        console.error('error creating user:', error)
      }
    }
  },
  async mounted() {
    // TODO: probably makes more sense to send users directly
    // instead of wrapping them in an object
    const { data: userData } = await axios.get('http://localhost:3000/users')
    this.users = userData.users
  }
}
</script>

<template lang="pug">
main
  h1 Users

  h2 Register
  form(@submit.prevent="submitForm")
    div
      label(for="username") Username:
      input(type="text" id="username" v-model="username" required)
    div
      label(for="email") Email:
      input(type="email" id="email" v-model="email" required)
    button(type="submit") Submit

  h2 Signed up users
  ul
    li(v-for='user in users', :key='user._id')
      | {{ user.username }}
</template>
