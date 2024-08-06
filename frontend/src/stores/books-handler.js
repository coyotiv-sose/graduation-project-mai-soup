import { defineStore } from 'pinia'
import useApiRequests from '../composables/useApiRequests'

export const useBooksHandler = defineStore('books-handler', {
  actions: {
    ...(() => {
      const { get } = useApiRequests()
      return {
        async fetchAllBooks() {
          const response = await get('/books')
          return response
        },
        async fetchBook(bookId) {
          const response = await get(`/books/${bookId}`)
          return response
        }
      }
    })()
  }
})
