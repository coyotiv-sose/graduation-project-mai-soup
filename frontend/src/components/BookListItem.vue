<template lang="pug">
// TODO: make the spinner prettier, works for now but not great UX
.grid(@click="addBook" :aria-busy="isReqInProgress")
  div
    h2 {{ book.title }} 
    p by {{ book.authors }}
  // TODO: add default image for books that don't have one at all
  img(:src="book.coverUrl" :alt="book.title")
</template>

<script>
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions } from 'pinia'

export default {
  name: 'BookListItem',
  props: ['book'],
  data() {
    return {
      library: this.$route.params.id,
      isReqInProgress: false
    }
  },
  methods: {
    ...mapActions(useLibrarianHandler, ['addCopy']),
    async addBook () {
      try {
        this.isReqInProgress = true
        await this.addCopy(this.library, this.book.id)

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
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  cursor: pointer;
}
</style>