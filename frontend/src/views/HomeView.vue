<template lang="pug">
header
  nav.navbar(role='navigation' aria-label='main navigation')
    .navbar-brand
      RouterLink.navbar-item.has-text-weight-bold.is-size-5(to='/') Porch Reads Club
      a.navbar-burger(role='button' aria-label='menu' :aria-expanded="isBurgerExpanded" :class='{"is-active": isBurgerExpanded}' @click='toggleBurger')
        span(aria-hidden='true')
        span(aria-hidden='true')
        span(aria-hidden='true')
        span(aria-hidden='true')
    .navbar-menu(:class='{"is-active": isBurgerExpanded}')
      .navbar-start
        RouterLink.navbar-item.active(to='/') Home
        RouterLink.navbar-item(to='/libraries') Libraries
        RouterLink.navbar-item(v-if='isLoggedIn' to='/books') Books
      .navbar-end
        RouterLink.navbar-item(v-if='!isLoggedIn' to='/login') Login
        RouterLink.navbar-item(v-if='!isLoggedIn' to='/signup') Sign Up
        a.navbar-item(v-if='isLoggedIn' @click='doLogout') Logout
.bg
  div
  .hero
    .hero-body
      p.title.mb-5  Porch Reads Club
      p.subtitle Welcome to your online library hub!
      p.subtitle Simplify book management, connect with members, 
        br 
        | and enhance your book lending experience.
      p.subtitle Dive in and explore libraries now!
      RouterLink.button.is-primary(to='/libraries') View Libraries
  footer
    p.mb-5.is-size-5 Maijs Garais, 2024
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'HomeView',
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
      console.log(this.isBurgerExpanded)
    }
  }
}
</script>

<style scoped lang="scss">
$text-color: rgba(255, 255, 255, 0.75);
.bg {
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url('/src/assets/landing-bg.webp');
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  box-shadow: inset 0 0 5rem rgba(0, 0, 0, 0.5);
}
</style>
