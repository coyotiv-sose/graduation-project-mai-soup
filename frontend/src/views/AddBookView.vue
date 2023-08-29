<template lang="pug">
.container 
  h1 Add Book to Library 
  // form for query
  form(@submit.prevent="doSearch")
    input(type="text" v-model="query")
    button(type="submit") Submit

  // if books not null, display a BookListItem component for each
  div(v-if="booksAreLoading" aria-busy="true")
  div(v-if="books")
    BookListItem(v-for="book in books" :key="book.canonicalVolumeLink" :book="book")
</template>


<script>
import axios from 'axios';
import BookListItem from '../components/BookListItem.vue';

export default {
  name: 'AddBook',
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
    async doSearch () {
      this.booksAreLoading = true;
      const results = await axios.get('/books', {
        params: {q: this.query}
      })

      this.books = results.data
      this.booksAreLoading = false
    }
  }
}
</script>