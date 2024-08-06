import { defineStore } from 'pinia'
import useApiRequests from '../composables/useApiRequests'

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
    ...(() => {
      const { get, post, del, patch } = useApiRequests()
      return {
        async fetchUser() {
          this.user = await get('/accounts/session')

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
          this.user = await post('/accounts/session', { username, password })
        },
        async logout() {
          await del('/accounts/session')
          this.user = null

          if (this.$router.currentRoute.value.meta.requiresAuth) {
            // if current route requires auth, redirect to login
            this.$router.push({ name: 'login' })
          }
        },
        async signUp({ username, email, password }) {
          await post('/accounts', { username, email, password })
        },
        isOwnerOfLibrary(libraryId) {
          if (!this.isLoggedIn) return false

          return this.user.ownedLibraries?.some(
            (library) => library._id === libraryId
          )
        }
      }
    })()
  }
})
