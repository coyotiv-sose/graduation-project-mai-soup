<template lang="pug">
div(v-if="!library") Loading...
div(v-else)
  h1 {{ library.name }}
  p Location: {{ library.latitude }}, {{ library.longitude }}
  p Owner:
    RouterLink(v-if="ownerUsername" :to="{ name: 'user', params: { username: ownerUsername } }") {{ ownerUsername }}
  h2 Books
  ul
    li(v-for="book in library.books" :key="book.isbn")
      RouterLink(:to="{ name: 'book', params: { isbn: book.isbn } }") {{ book.title }}
</template>

<script>
import axios from 'axios'
import { RouterLink } from 'vue-router'

export default {
  name: 'LibraryView',
  data() {
    return {
      library: null // init with null for clearer conditional checks
    }
  },
  components: {
    RouterLink
  },
  computed: {
    ownerUsername() {
      return this.library.owner ? this.library.owner.username : null
    }
  },
  async mounted() {
    const response = await axios.get(`/libraries/${this.$route.params.id}`)
    this.library = response.data
  }
}
</script>
