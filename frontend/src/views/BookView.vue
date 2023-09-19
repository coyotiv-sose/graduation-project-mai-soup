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
import { useBooksHandler } from '../stores/books-handler'
import { mapActions } from 'pinia'

export default {
  name: 'BookView',
  data() {
    return {
      book: null,
    }
  },
  methods: {
    ...mapActions(useBooksHandler, ['fetchBook']),
  },
  async mounted() {
    this.book = await this.fetchBook(this.$route.params.id)
  },
}
</script>
