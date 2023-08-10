<script>
import axios from 'axios'

export default {
  data() {
    return {
      user: {}
    }
  },
  async mounted() {
    const { data: userData } = await axios.get(
      `http://localhost:3000/users/${this.$route.params.username}`
    )
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
