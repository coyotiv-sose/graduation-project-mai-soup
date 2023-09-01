<script>
import axios from 'axios'
import { mapActions, mapState } from 'pinia'
import { useAccountStore } from '../stores/account'

axios.baseURL = import.meta.env.VITE_API_URL

export default {
  computed: {
    ...mapState(useAccountStore, ['user'])
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    async doReturnBook(book) {
      await axios.patch(`/copies/${book._id}`, {
        action: 'return'
      })
      await this.fetchUser()
    }
  }
}
</script>

<template lang="pug">
.container
  div(v-if="!user") Loading...
  div(v-else)
    h1 {{ user.username }}
    ul
      li Email: {{ user.email }}
      li Created at: {{ user.dateCreated }}
    h2 Memberships
    ul
      li(v-for="library in user.memberships" :key="library._id")
        RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
    h2 Loans
    table
      thead
        tr
          th Title
          th Status
          th Action
      tbody
        tr(v-for="book in user.loans" :key="book._id")
          td
            RouterLink(:to="{ name: 'book', params: { isbn: book.bookInfo.isbn } }") {{ book.bookInfo.title }}
          td
            span(v-if="book.status === 'borrowed'") Borrowed from {{ book.library.name }} until {{ book.returnDate }}
            span(v-else) {{ book.status }}
          td
            button(@click="doReturnBook(book)") Return
</template>
