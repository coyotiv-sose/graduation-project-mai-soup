<script>
import axios from 'axios'
import { mapStores } from 'pinia'
import { useUserStore } from '../stores/user'

export default {
  computed: {
    ...mapStores(useUserStore, ['userStore'])
  },
  data() {
    return {
      users: [],
      username: '',
      email: '',
      error: ''
    }
  },
  methods: {
    async submitForm() {
      try {
        const { data: userData } = await axios.post('http://localhost:3000/users', {
          username: this.username,
          email: this.email
        })

        // clear the input fields
        this.username = ''
        this.email = ''

        this.users.push(userData)

        this.error = ''
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          this.error = error.response.data.message
        } else {
          // Something happened in setting up the request that triggered an Error
          this.error = error.message
        }
      }
    },
    async login(username) {
      if (this.userStore.username) {
        return
      }

      await this.userStore.login(username)
    }
  },
  async mounted() {
    try {
      this.users = (await axios.get('http://localhost:3000/users')).data
    } catch (error) {
      // TODO: handle error
    }
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
    p.error(v-if="error") {{ error }}
    button(type="submit") Submit

  h2 Signed up users
  // for each user, show link to user page as well as log in button if not logged in
  div(v-for="user in users" :key="user.id")
    RouterLink(:to="{ name: 'user', params: { username: user.username } }") {{ user.username }}
    // if user is not logged in, show login button. if logged in, show nothing
    button(@click="login(user.username)" v-if="!userStore.username") Login
</template>

<style lang="scss">
.error {
  color: red;
}
</style>
