<template lang="pug">
h1 Create Book
// books have title, author, isbn
form(@submit.prevent="doCreateBook")
  div
    label(for="title") Title
    input#title(type="text" v-model="title" required)
  div
    label(for="author") Author
    input#author(type="text" v-model="author" required)
  div
    label(for="isbn") ISBN
    input#isbn(type="text" v-model="isbn" required)
  div
    button(type="submit") Create Book
</template>

<script>
import axios from 'axios'

export default {
  name: 'CreateBookView',
  data() {
    return {
      title: '',
      author: '',
      isbn: ''
    }
  },
  methods: {
    async doCreateBook() {
      await axios.post('/books', {
        title: this.title,
        author: this.author,
        isbn: this.isbn
      })
      this.$router.push({ name: 'books' })
    }
  }
}
</script>
