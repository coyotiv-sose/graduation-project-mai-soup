<template lang="pug">
.container
  h1.title Loans
  div(v-if='!loans') Loading...
  // if logged in user has any loans, show them
  BookTable(
    v-if='loans && loans.length > 0',
    :bookData='loans',
    :isOwner='false',
    :isMember='true'
  )
  // if logged in user has no loans, show a message
  p(v-else) You have no loans.
</template>

<script>
import BookTable from '../components/BookTable.vue'
import { useAccountStore } from '../stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'LoansView',
  components: {
    BookTable
  },
  computed: {
    ...mapState(useAccountStore, ['loans'])
  },
  mounted() {
    this.fetchUser()
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser'])
  }
}
</script>

<style scoped>
.expiring {
  color: red;
}
</style>
