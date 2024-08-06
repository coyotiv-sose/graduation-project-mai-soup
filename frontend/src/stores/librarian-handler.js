import { defineStore } from 'pinia'
import useApiRequests from '../composables/useApiRequests'

export const useLibrarianHandler = defineStore('librarian-handler', {
  actions: {
    ...(() => {
      const { post, patch, del } = useApiRequests()
      return {
        async createBook({ library, title, authors }) {
          await post(`/libraries/${library}/books`, { title, authors })
        },
        async removeBook({ libraryId, bookId }) {
          await del(`/libraries/${libraryId}/books/${bookId}`)
        },
        async updateLibrary(libraryId, name, location) {
          await patch(`/libraries/${libraryId}`, { name, location })
        }
      }
    })()
  }
})
