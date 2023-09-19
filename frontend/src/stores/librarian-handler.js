import { defineStore } from 'pinia'
import axios from 'axios'

export const useLibrarianHandler = defineStore('librarian-handler', {
  actions: {
    async removeCopy(libraryId, bookCopyId) {
      try {
        await axios.delete(`/libraries/${libraryId}/copies/${bookCopyId}`)
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
