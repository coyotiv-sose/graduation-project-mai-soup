<script>
import axios from 'axios'

axios.baseURL = import.meta.env.VITE_API_URL

export default {
  data() {
    return {
      users: []
    }
  },
  async mounted() {
    try {
      this.users = (await axios.get('/users')).data
    } catch (error) {
      // TODO: handle error
    }
  }
}
</script>

<template lang="pug">
.container
  main
    h1 Users

    h2 Signed up users
    div(v-for="user in users" :key="user.id")
      RouterLink(:to="{ name: 'user', params: { username: user.username } }") {{ user.username }}
</template>

<style lang="scss">
.error {
  color: red;
}
</style>
