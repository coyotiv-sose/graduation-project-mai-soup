<script>
import axios from 'axios'

axios.baseURL = import.meta.env.VITE_API_URL

export default {
  data() {
    return {
      user: {}
    }
  },
  async mounted() {
    const { data: userData } = await axios.get(`/users/${this.$route.params.username}`)
    this.user = userData

    // TODO: handle error
  }
}
</script>

<template lang="pug">
h1 {{ user.username }}
ul
  li Email: {{ user.email }}
  li Created at: {{ user.dateCreated }}
</template>
