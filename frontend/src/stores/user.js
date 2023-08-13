import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({ user: { username: '' } }),
  getters: {
    username: (state) => state.user.username,
    isLoggedIn: (state) => !!state.user.username
  },
  actions: {
    login(username) {
      this.user.username = username
    },
    logout() {
      this.user.username = ''
    }
  }
})
