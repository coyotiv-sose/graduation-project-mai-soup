<template lang="pug">
.container
  h1 Add Book to Library
  // form for query to search for
  // TODO: refactor to be same as other forms
  form(v-on:submit.prevent="onSubmit")
    input(type="text" v-model="query" placeholder="Search for a book...")
    small(v-if="queryError") {{ queryError }}
    button(type="submit" :disabled="shouldPreventSubmission") Submit

  // if books not null, display a BookListItem component for each
  div(v-if="booksAreLoading" aria-busy="true")
  div(v-if="books")
    BookListItem(v-for="book in books" :key="book.id" :book="book")
  div(v-if="!books?.length && booksLoaded")
    p No results found. Check your spelling, or try another query?
</template>

<script>
import axios from 'axios';
import BookListItem from '../components/BookListItem.vue';

export default {
  name: 'AddBookView',
  components: {
    BookListItem
  },
  data () {
    return {
      query: '',
      queryError: null,
      books: null,
      booksAreLoading: false,
      booksLoaded: false,
    }
  },
  computed: {
    shouldPreventSubmission() {
      return !this.query || this.queryError
    }
  },
  methods: {
    async onSubmit () {
      if (this.shouldPreventSubmission) return

      this.booksLoaded = false
      this.booksAreLoading = true
      const results = await axios.get('/open-books', {
        params: {
          q: this.query
        }
      })

      this.books = results.data
      this.booksAreLoading = false
      this.booksLoaded = true
    },
    validateQuery(query) {
      if (!query || query.trim().length < 3) {
        this.queryError = "Query must be at least 3 characters long"
        return
      }

      this.queryError = null
    }
  },
  watch: {
    query(value) {
      this.query = value
      this.validateQuery(value)
    }
  }
}
</script>