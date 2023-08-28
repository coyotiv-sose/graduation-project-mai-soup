<template lang="pug">
h1 Google Books API test
// form for query to search for
form(v-on:submit.prevent="onSubmit")
  input(type="text" v-model="query")
  button(type="submit") Submit
</template>

<script>
import axios from 'axios';

export default {
  name: 'GoogleBooks',
  data () {
    return {
      query: ''
    }
  },
  methods: {
    onSubmit () {
      const results = axios.post('/books/google-books-search', {
        query: this.query
      })

      results.then(response => {
        console.log(response.data)
      })
    }
  }
}
</script>