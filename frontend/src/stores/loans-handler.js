import { defineStore } from 'pinia'
import useApiRequests from '../composables/useApiRequests'

export const useLoansHandler = defineStore('loans-handler', {
  actions: {
    ...(() => {
      const { patch } = useApiRequests()
      return {
        async borrowBook(libraryId, bookId) {
          await patch(`/libraries/${libraryId}/books/${bookId}`, {
            action: 'borrow'
          })
        },
        async returnBook(libraryId, bookId) {
          await patch(`/libraries/${libraryId}/books/${bookId}`, {
            action: 'return'
          })
        },
        async extendLoan(libraryId, bookId) {
          await patch(`/libraries/${libraryId}/books/${bookId}`, {
            action: 'extend'
          })
        }
      }
    })()
  }
})
