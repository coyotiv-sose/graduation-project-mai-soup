<template lang="pug">
.container
  h1 Open Library Books API test
  // form for query to search for
  // TODO: refactor to be same as other forms
  form(v-on:submit.prevent="onSubmit")
    input(type="text" v-model="query")
    button(type="submit") Submit

  // if books not null, display a BookListItem component for each
  div(v-if="booksAreLoading" aria-busy="true")
  div(v-if="books")
    BookListItem(v-for="book in books" :key="book.id" :book="book")
</template>

<script>
import axios from 'axios';
import BookListItem from '../components/BookListItem.vue';

export default {
  name: 'OpenLibraryBooks',
  components: {
    BookListItem
  },
  data () {
    return {
      query: '',
      books: null,
      booksAreLoading: false,
    }
  },
  methods: {
    async onSubmit () {
      this.booksAreLoading = true;
      const results = await axios.get('/open-books', {
        params: {
          q: this.query
        }
      })

      this.books = results.data
      this.booksAreLoading = false
    }
  }
}
</script>