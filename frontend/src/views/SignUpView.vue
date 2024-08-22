<template lang="pug">
.container
  h1.title Sign Up
  // TODO: prevent form submission altogether if validation fails, not just through button
  form(@submit.prevent="performSignUp")
    .field
      .control.has-icons-left 
        input.input(type="text" id="username" v-model="username" minlength="3" maxlength="24" pattern="^[a-zA-Z0-9_-]+$" placeholder="Username" required)
        span.icon.is-small.is-left
          font-awesome-icon(icon="user")
      p.help.is-danger(v-if="usernameError") {{ usernameError }}
    .field
      .control.has-icons-left 
        input.input(type="email" id="email" v-model="email" placeholder="Email" required)
        span.icon.is-small.is-left
          font-awesome-icon(icon="envelope")
      p.help.is-danger(v-if="emailError") {{ emailError }}
    .field
      .control.has-icons-left 
        input.input(type="password" id="password" v-model="password" placeholder="Password" required)
        span.icon.is-small.is-left
          font-awesome-icon(icon="lock")
      p.help.is-danger(v-if="passwordError") {{ passwordError }}
    .field
      .control
        button.button.is-success(type="submit" :disabled="shouldDisableSubmit") Sign Up
</template>

<script>
import { mapActions } from 'pinia'
import { useAccountStore } from '../stores/account'
import validator from 'email-validator'

export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      usernameError: null,
      emailError: null,
      // TODO: add password validation once implemented in backend
      passwordError: null
    }
  },
  computed: {
    shouldDisableSubmit() {
      return (
        this.usernameError ||
        this.emailError ||
        this.passwordError ||
        !this.username ||
        !this.email ||
        !this.password
      )
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
      this.$router.push({ name: 'login' })
    },
    validateUsername(username) {
      if (username.length < 3) {
        this.usernameError = 'Username must be at least 3 characters'
        return
      }

      if (username.length > 24) {
        this.usernameError = 'Username cannot exceed 24 characters'
        return
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        this.usernameError =
          'Username can only contain letters, numbers, underscores and dashes'
        return
      }

      this.usernameError = null
    },
    validateEmail(email) {
      if (!validator.validate(email)) {
        this.emailError = 'Please enter a valid email address'
        return
      }

      this.emailError = null
    }
  },
  watch: {
    username(value) {
      this.username = value
      this.validateUsername(value)
    },
    email(value) {
      this.email = value
      this.validateEmail(value)
    }
  }
}
</script>
