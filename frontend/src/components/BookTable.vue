<template lang="pug">
//- table to show the books in the library
table.table
  thead
    tr 
      th Title
      th Author(s)
      th Status
      th(v-if="isLoggedIn && isMember") Actions
  tbody
    tr(v-for="book in this.books" :key="book._id")
      td {{ book.title }}
      td {{ book.authors }}
      td
        span(v-if="book.status === 'borrowed'") {{ this.toReturnDateFormat(book.returnDate) }}
        span(v-else) {{ book.status }}
      td.buttons(v-if="isLoggedIn && isMember")
        button.button.is-primary.is-small(v-if="book.status === 'available'" @click="doBorrowOrReturn(book)") Borrow
        button.button.is-small(v-if="book.status === 'borrowed' && book.borrower.username === this.username" @click="doBorrowOrReturn(book)") Return
        button.button.is-danger.is-small(v-if="isOwner" @click="doRemoveBook(book)") Remove from library
</template>

<script>
import useDateFormatter from '../composables/useDateFormatter'
import { useAccountStore } from '../stores/account'
import { useLoansHandler } from '../stores/loans-handler'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'BookTable',
  props: {
    bookData: { type: Array, required: true },
    isOwner: { type: Boolean, default: false },
    isMember: { type: Boolean, default: false }
  },
  data() {
    return {
      books: this.bookData
    }
  },
  setup() {
    const { toReturnDateFormat } = useDateFormatter()
    return { toReturnDateFormat }
  },
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn', 'username'])
  },
  methods: {
    ...mapActions(useLoansHandler, ['borrowBook', 'returnBook']),
    ...mapActions(useAccountStore, ['isOwnerOfLibrary']),
    ...mapActions(useLibrarianHandler, ['removeBook']),
    async doBorrowOrReturn(book) {
      const libraryId = this.$route.params.id
      if (book.status === 'borrowed') {
        await this.returnBook(libraryId, book._id)
      } else {
        await this.borrowBook(libraryId, book._id)
      }

      // TODO: should fetch updated book data instead
      book.status = book.status === 'borrowed' ? 'available' : 'borrowed'
    },
    async doRemoveBook(book) {
      await this.removeBook({
        libraryId: this.$route.params.id,
        bookId: book._id
      })

      this.books = this.books.filter((b) => b._id !== book._id)
    }
  }
}
</script>
