<script>
import axios from 'axios'

export default {
  data() {
    return {
      users: []
    }
  },
  async mounted() {
    // TODO: probably makes more sense to send users directly
    // instead of wrapping them in an object
    const { data: userData } = await axios.get('http://localhost:40927/users?json=true')
    this.users = userData.users
  }
}
</script>

<template lang="pug">
main
  h1 Users
  ul
    li(v-for='user in users', :key='user._id')
      | {{ user.username }}
</template>
