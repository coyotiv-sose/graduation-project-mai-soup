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

  h2 Remove from library
  select(v-model="libraryId")
    option(v-for="library in ownedLibrariesWithBook" :key="library._id" :value="library._id") {{ library.name }}
  button(@click="doRemoveFromLibrary") Remove from library
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
    axios
      .get(`http://localhost:3000/books/${this.$route.params.isbn}`)
      .then((response) => {
        this.book = response.data
      })
  },
  computed: {
    ...mapState(useAccountStore, ['ownedLibraries']),
    ownedLibrariesWithBook() {
      if (this.book && this.ownedLibraries) {
        return this.ownedLibraries.filter((library) => {
          return library.books.some((b) => b.isbn === this.book.isbn)
        })
      }
      return []
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    async doAddToLibrary() {
      await axios.post(
        `http://localhost:3000/libraries/${this.libraryId}/books`,
        {
          isbn: this.book.isbn
        }
      )
      await this.fetchUser()
      this.$router.push({ name: 'library', params: { id: this.libraryId } })
    },
    async doRemoveFromLibrary() {
      await axios.delete(
        `http://localhost:3000/libraries/${this.libraryId}/books/${this.book.isbn}`
      )
      await this.fetchUser()
      this.$router.push({ name: 'library', params: { id: this.libraryId } })
    }
  }
}
</script>
