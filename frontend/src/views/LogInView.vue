<script>
import axios from 'axios'
import { useAccountStore } from '../stores/account'
import { mapActions } from 'pinia'

export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['login']),
    async performLogin() {
      try {
        await this.login({ username: this.username, password: this.password })
        this.$router.push('/')
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<template lang="pug">
h1 Log In
form(@submit.prevent="performLogin")
  input(type="text" placeholder="Username" v-model="username")
  input(type="password" placeholder="Password" v-model="password")
  button(type="submit") Log In
</template>
