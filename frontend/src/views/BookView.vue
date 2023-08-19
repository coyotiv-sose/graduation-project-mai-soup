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

// if the logged in user owns any libraries, show a menu to add the book to one of them
// if the logged in user doesn't own any libraries, show a message
// if the book is already in a library, show a menu to remove it from that library

div(v-if="ownedLibraries && ownedLibraries.length > 0")
  h2 Add to library
  select(v-model="libraryId")
    option(v-for="library in ownedLibraries" :key="library._id" :value="library._id") {{ library.name }}
  button(@click="doAddToLibrary") Add to library
</template>

<script>
import axios from 'axios'
import { useAccountStore } from '../stores/account'
import { mapState } from 'pinia'

export default {
  name: 'BookView',
  data() {
    return {
      book: null
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
    ...mapState(useAccountStore, ['ownedLibraries'])
  },
  mounted() {
    console.log('account', this.ownedLibraries)
  },
  methods: {
    async doAddToLibrary() {
      await axios.post(
        `http://localhost:3000/libraries/${this.libraryId}/books`,
        {
          isbn: this.book.isbn
        }
      )
      this.$router.push({ name: 'library', params: { id: this.libraryId } })
    }
  }
}
</script>
