<template lang="pug">
.container
  div(v-if="!user") Loading...
  div(v-else)
    h1 {{ user.username }}
    h2 Memberships
    ul
      li(v-for="library in user.memberships" :key="library._id")
        RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
</template>
<script>
import axios from 'axios'

export default {
  name: 'ProfileView',
  data() {
    return {
      user: null
    }
  },
  async mounted() {
    this.user = (await axios.get(`/users/${this.$route.params.username}`)).data
  },
}
</script>