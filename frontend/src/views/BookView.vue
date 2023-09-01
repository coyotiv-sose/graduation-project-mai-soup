<template lang="pug">
.container
  div(v-if="book")
    h1 {{ book.title }}
    img(:src="book.imageUrl" :alt="book.title")
    div by {{ book.authors.join(', ') }}

    h2 Libraries
      ul
        li(v-for="library in book.librariesFoundIn" :key="library._id")
          RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
  div(v-else) Loading...
</template>

<script>
import axios from 'axios'

export default {
  name: 'BookView',
  data() {
    return {
      book: null,
    }
  },
  created() {
    axios.get(`/books/${this.$route.params.id}`).then((response) => {
      this.book = response.data
    })
  },
}
</script>
