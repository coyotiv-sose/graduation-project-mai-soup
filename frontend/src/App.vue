<template lang="pug">
div(v-if='!isInHomeRoute')
  header.navbar
    nav.nav-items
      RouterLink(to='/') Home
      RouterLink(to='/libraries') Libraries
      RouterLink(v-if='isLoggedIn' to='/books') Books
      RouterLink(v-if='isLoggedIn' to='/loans') Loans
      RouterLink(v-if='!isLoggedIn' to='/login') Login
      RouterLink(v-if='!isLoggedIn' to='/signup') Sign Up
    .user-info(v-if='isLoggedIn')
      span Hello, {{ username }}!
      button(@click='doLogout') Logout
RouterView
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import { useAccountStore } from './stores/account'
import { mapActions, mapState } from 'pinia'
import axios from 'axios'

// set up axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true

export default {
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn', 'username']),
    isInHomeRoute() {
      return this.$route.name === 'home'
    }
  },
  components: {
    RouterLink,
    RouterView
  },
  methods: {
    ...mapActions(useAccountStore, ['logout']),
    async doLogout() {
      await this.logout()
    }
  },
}
</script>

<style scoped lang="scss">
/* TODO: add proper styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .nav-items {
    display: flex;
    gap: 15px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
</style>
