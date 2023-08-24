<script>
import { mapActions } from 'pinia'
import { useAccountStore } from '../stores/account'

export default {
  data() {
    return {
      username: '',
      email: '',
      password: ''
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['signUp']),
    async performSignUp() {
      await this.signUp({
        username: this.username,
        email: this.email,
        password: this.password
      })
      this.$router.push('/login')
    }
  }
}
</script>

<template lang="pug">
.container
  h1 Sign Up
  form(@submit.prevent="performSignUp")
    div.form-group
      label(for="username") Username
      input.form-control(type="text" id="username" v-model="username")
    div.form-group
      label(for="email") Email
      input.form-control(type="email" id="email" v-model="email")
    div.form-group
      label(for="password") Password
      input.form-control(type="password" id="password" v-model="password")
    div.form-group
      button.btn.btn-primary(type="submit") Sign Up
</template>
