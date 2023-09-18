import { defineStore } from 'pinia'
import axios from 'axios'

export const useAccountStore = defineStore('account', {
  state: () => ({ user: null }),
  getters: {
    username: (state) => state.user?.username,
    isLoggedIn: (state) => !!state.user,
    ownedLibraries: (state) => state.user?.ownedLibraries,
    loans: (state) => state.user?.loans
  },
  actions: {
    async fetchUser() {
      this.user = (await axios.get('/accounts/session')).data
    },
    async login({ username, password }) {
      this.user = (
        await axios.post('/accounts/session', { username, password })
      ).data
    },
    async logout() {
      await axios.delete('/accounts/session')
      this.user = null

      if (this.$router.currentRoute.value.meta.requiresAuth) {
        // if current route requires auth, redirect to login
        this.$router.push('/login')
      }
    },
    async signUp({ username, email, password }) {
      await axios.post('/accounts', { username, email, password })
    }
  }
})
