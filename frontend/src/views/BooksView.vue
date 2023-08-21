<template lang="pug">
h1 Books
RouterLink(:to="{ name: 'create-book' }") Add New
// render table if books are loaded, otherwise show loading message. if no books exist, show message that no books exist.
div(v-if="books?.length")
  table
    thead
      tr
        th Title
        th Author
        th Actions
    tbody
      tr(v-for="book in books" :key="book.id")
        td {{ book.title }}
        td {{ book.author }}
        td
          RouterLink(:to="{ name: 'book', params: { isbn: book.isbn } }") View
div(v-else)
  div(v-if="books === null") Loading...
  div(v-else) No books exist.
    RouterLink(:to="{ name: 'create-book' }") Add New Book?
</template>

<script>
import axios from 'axios'
import { RouterLink } from 'vue-router'

export default {
  name: 'BooksView',
  components: {
    RouterLink
  },
  data() {
    return {
      books: null
    }
  },
  created() {
    axios.get('/books').then((response) => {
      this.books = response.data
    })
  }
}
</script>
