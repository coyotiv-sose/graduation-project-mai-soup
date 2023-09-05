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
  data() {
    return {
      library: this.$route.params.id
    }
},
  methods: {
    async addBook () {
      try {
        console.log(this.book)
        await axios.post('/libraries/' + this.library + '/copies', {
          openLibraryId: this.book.id
        })

        this.$router.push({ name: 'owned-library', params: { id: this.library } })
      } catch (err) {
        // TODO: handle error case
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