<script>
import axios from 'axios'

export default {
  data() {
    return {
      users: []
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

  h2 Signed up users
  div(v-for="user in users" :key="user.id")
    RouterLink(:to="{ name: 'user', params: { username: user.username } }") {{ user.username }}
</template>

<style lang="scss">
.error {
  color: red;
}
</style>
