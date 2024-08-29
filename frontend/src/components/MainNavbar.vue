<template lang="pug">
header
  nav.navbar.is-primary(role='navigation', aria-label='main navigation')
    .navbar-brand
      RouterLink.navbar-item.has-text-weight-bold.is-size-5(
        to='/',
        active-class=''
      ) Porch Reads Club
      a.navbar-burger(
        role='button',
        aria-label='menu',
        :aria-expanded='isBurgerExpanded',
        :class='{ "is-active": isBurgerExpanded }',
        @click='toggleBurger'
      )
        span(aria-hidden='true')
        span(aria-hidden='true')
        span(aria-hidden='true')
        span(aria-hidden='true')
    .navbar-menu(:class='{ "is-active": isBurgerExpanded }')
      .navbar-start
        RouterLink.navbar-item(to='/') Home
        RouterLink.navbar-item(to='/libraries') Libraries
        RouterLink.navbar-item(v-if='isLoggedIn', to='/loans') Loans
      .navbar-end
        //- TODO: add greeting if user logged in
        RouterLink.navbar-item(v-if='!isLoggedIn', to='/login') Login
        RouterLink.navbar-item(v-if='!isLoggedIn', to='/signup') Sign Up
        a.navbar-item(v-if='isLoggedIn', @click='doLogout') Logout
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'MainNavbar',
  components: {
    RouterLink
  },
  data() {
    return {
      isBurgerExpanded: false
    }
  },
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn'])
  },
  methods: {
    ...mapActions(useAccountStore, ['logout']),
    async doLogout(e) {
      console.log('doLogout')
      e.preventDefault()
      await this.logout()
    },
    toggleBurger() {
      this.isBurgerExpanded = !this.isBurgerExpanded
    }
  }
}
</script>
