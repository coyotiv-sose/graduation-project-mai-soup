import { defineStore } from 'pinia'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000'
axios.defaults.withCredentials = true

export const useAccountStore = defineStore('account', {
  state: () => ({ user: null }),
  getters: {
    username: (state) => state.user?.username,
    isLoggedIn: (state) => !!state.user.username
  },
  actions: {
    async fetchUser() {
      this.user = (await axios.get('/accounts/session')).data
    },
    async login(username, password) {
      this.user = (await axios.post('/accounts/session', { username, password })).data
    },
    async logout() {
      await axios.delete('/accounts/session')
      this.user = null
    }
  }
})
