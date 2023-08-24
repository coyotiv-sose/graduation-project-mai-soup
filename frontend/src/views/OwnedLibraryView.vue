<template lang="pug">
.container
  div(v-if="!library") Loading...
  div(v-else)
    h1 {{ library.name }}
    p Location: {{ library.latitude }}, {{ library.longitude }}
    h2 Members
    ul
      li(v-for="member in library.members" :key="member._id")
        RouterLink(:to="{ name: 'user', params: { username: member._id } }") {{ member.username }}
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
            RouterLink(:to="{ name: 'book', params: { isbn: book.bookInfo.isbn } }") {{ book.bookInfo.title }}
          td
            span(v-if="book.status === 'borrowed'") Borrowed by {{ book.borrower.username }} until {{ book.returnDate }}
            span(v-else) {{ book.status }}
          td
            button(@click="doRemoveBook(book)") Remove from library
</template>

<script>
import axios from 'axios'
import { mapState } from 'pinia'
import { useAccountStore } from '../stores/account'

export default {
  name: 'OwnedLibraryView',
  data() {
    return {
      library: null // init with null for clearer conditional checks
    }
  },
  computed: {
    ...mapState(useAccountStore, ['user'])
  },
  async mounted() {
    const response = await axios.get(`/libraries/${this.$route.params.id}`)
    this.library = response.data
  },
  methods: {
    async doRemoveBook(book) {
      const response = await axios.delete(
        `/libraries/${this.$route.params.id}/books/${book._id}`
      )
      this.library = response.data
    }
  }
}
</script>
