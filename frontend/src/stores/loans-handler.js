import { defineStore } from 'pinia'
import axios from 'axios'

export const useLoansHandler = defineStore('loans-handler', {
  actions: {
    async borrowBook(libraryId, bookCopyId) {
      try {
        await axios.patch(`/libraries/${libraryId}/books/${bookCopyId}`, {
          action: 'borrow'
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async returnBook(libraryId, bookCopyId) {
      try {
        await axios.patch(`/libraries/${libraryId}/books/${bookCopyId}`, {
          action: 'return'
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async extendLoan(libraryId, bookCopyId) {
      try {
        await axios.patch(`/libraries/${libraryId}/books/${bookCopyId}`, {
          action: 'extend'
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
