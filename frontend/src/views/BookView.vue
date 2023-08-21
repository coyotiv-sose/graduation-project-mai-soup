<template lang="pug">
div(v-if="book")
  h1 {{ book.title }}
  div by {{ book.author }}
  div ISBN: {{ book.isbn }}

  h2 Libraries
    ul
      li(v-for="library in book.librariesFoundIn" :key="library._id")
        RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
div(v-else) Loading...

div(v-if="ownedLibraries && ownedLibraries.length > 0")
  h2 Add to library
  select(v-model="libraryId")
    option(v-for="library in ownedLibraries" :key="library._id" :value="library._id") {{ library.name }}
  button(@click="doAddToLibrary") Add to library
</template>

<script>
import axios from 'axios'
import { useAccountStore } from '../stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'BookView',
  data() {
    return {
      book: null,
      libraryId: null
    }
  },
  created() {
    axios.get(`/books/${this.$route.params.isbn}`).then((response) => {
      this.book = response.data
    })
  },
  computed: {
    ...mapState(useAccountStore, ['ownedLibraries'])
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    async doAddToLibrary() {
      await axios.post(`/libraries/${this.libraryId}/copies`, {
        isbn: this.book.isbn
      })
      await this.fetchUser()
      this.$router.push({ name: 'library', params: { id: this.libraryId } })
    }
  }
}
</script>
