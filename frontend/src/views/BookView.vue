<template lang="pug">
div(v-if="book")
  h1 {{ book.title }}
  div by {{ book.author }}
  div ISBN: {{ book.isbn }}
div(v-else) Loading...
</template>

<script>
import axios from 'axios'

export default {
  name: 'BookView',
  data() {
    return {
      book: null
    }
  },
  created() {
    axios.get(`http://localhost:3000/books/${this.$route.params.isbn}`).then((response) => {
      this.book = response.data
    })
  }
}
</script>
