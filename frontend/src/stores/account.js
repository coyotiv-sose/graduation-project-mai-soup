import { defineStore } from 'pinia'
import axios from 'axios'

export const useAccountStore = defineStore('account', {
  state: () => ({ user: null }),
  getters: {
    username: (state) => state.user?.username,
    isLoggedIn: (state) => !!state.user,
    ownedLibraries: (state) => state.user?.ownedLibraries,
    loans: (state) => state.user?.loans,
    hasLoans: (state) => !!state.user?.loans.length
  },
  actions: {
    async fetchUser() {
      this.user = (await axios.get('/accounts/session')).data

      // add fields for whether the loan is about to expire
      if (this.user) {
        this.user.loans = this.user.loans.map((loan) => {
          const loanReturnDate = new Date(loan.returnDate)
          loan.isExpiringSoon =
            loanReturnDate - new Date() < 1000 * 60 * 60 * 24 * 3
          loan.isExpiringInAWeek =
            loanReturnDate - new Date() < 1000 * 60 * 60 * 24 * 7
          return loan
        })
      }
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
        this.$router.push({ name: 'login' })
      }
    },
    async signUp({ username, email, password }) {
      await axios.post('/accounts', { username, email, password })
    },
    isOwnerOfLibrary(libraryId) {
      if (!this.isLoggedIn) return false

      return this.user.ownedLibraries?.some(
        (library) => library._id === libraryId
      )
    }
  }
})
