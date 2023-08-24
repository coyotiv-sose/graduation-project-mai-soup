<template lang="pug">
div(v-if="!library") Loading...
div(v-else)
  h1 {{ library.name }}
  p Location: {{ library.latitude }}, {{ library.longitude }}
  h2 Members
  ul
    li(v-for="member in library.members" :key="member._id")
      RouterLink(:to="{ name: 'user', params: { username: member._id } }") {{ member.username }}
  h2 Books
  ul
    li(v-for="book in library.books" :key="book._id")
      div
        RouterLink(:to="{ name: 'book', params: { isbn: book.bookInfo.isbn } }") {{ book.bookInfo.title }}
        span(v-if="book.status === 'borrowed' && book.borrower.username !== this.username") Borrowed by {{ book.borrower.username }} until {{ book.returnDate }}
        button(v-if="isUserMember && book.status === 'available'" @click="doBorrowOrReturn(book)") Borrow
        button(v-if="isUserMember && book.status === 'borrowed' && book.borrower.username === this.username" @click="doBorrowOrReturn(book)") Return
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
  }
}
</script>
