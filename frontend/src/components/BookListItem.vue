<template lang="pug">
.grid(@click="addBook")
  div
    h2 {{ book.title }} 
    p by {{ book.authors[0] }}
  // TODO: add downsized regular thumbnail if there's no small version
  // TODO: add default image for books that don't have one at all
  img(:src="book.imageLinks?.smallThumbnail" :alt="book.title")
</template>

<script>
import axios from 'axios'

export default {
  name: 'BookListItem',
  props: ['book'],
  methods: {
    async addBook () {
      const response = await axios.post('/api/books', this.book)

      if (response.status === 202) {
        window.alert(response.data.message)
      } else if (response.status === 201) {
        this.$router.push({ name: 'book', params: { isbn: this.book.industryIdentifiers[0].identifier}})
      }

      // TODO: error handling
    }
  }
}
</script>

<style scoped lang="scss">
.grid {
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6)
}
</style>