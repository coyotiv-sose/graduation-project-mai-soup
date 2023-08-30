<template lang="pug">
.grid(@click="addBook")
  div
    h2 {{ book.title }} 
    p by {{ book.authors }}
  // TODO: add default image for books that don't have one at all
  img(:src="book.coverUrl" :alt="book.title")
</template>

<script>
import axios from 'axios'

export default {
  name: 'BookListItem',
  props: ['book'],
  methods: {
    async addBook () {
      try {
        const response = await axios.post('/books', {
          id: this.book.id
        })

        if (response.status === 201) {
          window.alert('book added successfully')
          // TODO: handle success case
        }
      } catch (err) {
        if (err.response.status === 409) {
          this.$router.push({ name: 'book', params: { id: this.book.id}})
        } else {
          // handle other errors
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.grid {
  padding-top: 1rem;
  padding-bottom: 1rem;
  // TODO: the last one has a border too, it shouldn't?
  border-bottom: 1px solid rgba(255, 255, 255, 0.6)
}
</style>