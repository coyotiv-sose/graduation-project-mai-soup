<script>
import { useAccountStore } from '../stores/account'
import { mapActions } from 'pinia'

export default {
  data() {
    return {
      // can be username or email
      identifier: '',
      password: ''
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['login']),
    async performLogin() {
      try {
        await this.login({ username: this.identifier, password: this.password })
        this.$router.push('/')
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<template lang="pug">
.container
  h1 Log In
  form(@submit.prevent="performLogin")
    input(type="text" placeholder="Username or email" v-model="identifier")
    input(type="password" placeholder="Password" v-model="password")
    button(type="submit") Log In
</template>
