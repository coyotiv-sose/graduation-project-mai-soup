<template lang="pug">
.container
  div(v-if="!library") Loading...
  div(v-else)
    h1 {{ library.name }}
    p Location: {{ library.location }}
    SingleLibraryMap(:coordinates="library.geometry.coordinates", :libraryName="library.name")
    // link to add new book
    RouterLink(:to="{name: 'add-book', params: {id: this.$route.params.id}}") Add New Book
    br
    RouterLink(:to="{name: 'edit-library', params: {id: this.$route.params.id}}") Edit Library
    h2 Members
    ul
      li(v-for="member in library.members" :key="member._id")
        RouterLink(:to="{ name: 'profile', params: { username: member.username } }") {{ member.username }}
    h2 Books
    table
      thead
        tr
          th Title
          th Status
          th Action
      tbody
        tr(v-for="book in library.books" :key="book._id")
          td
            RouterLink(:to="{ name: 'book', params: { id: book.bookInfo.openLibraryId } }") {{ book.bookInfo.title }}
          td
            span(v-if="book.status === 'borrowed'") Borrowed by {{ book.borrower.username }} until {{ book.returnDate }}
            span(v-else) {{ book.status }}
          td
            button(@click="doRemoveBook(book)") Remove from library
</template>

<script>
import axios from 'axios'
import { mapState, mapActions } from 'pinia'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'
import SingleLibraryMap from '../components/SingleLibraryMap.vue'

export default {
  name: 'OwnedLibraryView',
  data() {
    return {
      library: null // init with null for clearer conditional checks
    }
  },
  components: {
    SingleLibraryMap,
  },
  computed: {
    ...mapState(useAccountStore, ['user'])
  },
  async mounted() {
    this.library = await this.fetchLibrary(this.$route.params.id)
  },
  methods: {
    ...mapActions(useLibraryHandler, ['fetchLibrary']),
    async doRemoveBook(book) {
      await axios.delete(
        `/libraries/${this.$route.params.id}/books/${book._id}`
      )
      this.library.books = this.library.books.filter(
        (b) => b._id!== book._id
        )
    }
  }
}
</script>
