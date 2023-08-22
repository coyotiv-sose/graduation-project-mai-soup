<template lang="pug">
h1 Loans
// if logged in user has any loans, show them
div(v-if="loans?.length > 0")
  ul
    li(v-for="loan in loans" :key="loan._id")
      div
        RouterLink(:to="{ name: 'book', params: { isbn: loan.bookInfo.isbn } }") {{ loan.bookInfo.title }}
        span Borrowed until {{ loan.returnDate }}
        button(@click="doReturn(loan)") Return
// else, if length 0, show a message. if null, show loading
div(v-else-if="loans?.length === 0") You have no loans.
div(v-else) Loading...
</template>

<script>
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'LoansView',
  components: {
    RouterLink
  },
  mounted() {
    this.fetchUser()
  },
  computed: {
    ...mapState(useAccountStore, ['loans'])
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    async doReturn(loan) {
      await axios.patch(`/copies/${loan._id}`, { action: 'return' })
      this.fetchUser()
    }
  }
}
</script>
