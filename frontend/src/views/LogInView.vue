<template lang="pug">
h1.title Log In
form(@submit.prevent='performLogin')
  .field
    .control.has-icons-left
      input.input(
        type='text',
        placeholder='Username or email',
        v-model='identifier'
      )
      span.icon.is-small.is-left
        font-awesome-icon(icon='user')
  .field
    .control.has-icons-left
      input.input(type='password', placeholder='Password', v-model='password')
      span.icon.is-small.is-left
        font-awesome-icon(icon='lock')
  .field
    .control
      button.button.is-success(type='submit') Log In
</template>

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
        this.$router.push({ name: 'home' })
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>
