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
    },
    async addCopy(libraryId, bookId) {
      try {
        await axios.post(`/libraries/${libraryId}/copies`, {
          openLibraryId: bookId
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async createLibrary(name, location) {
      try {
        const response = await axios.post('/libraries', {
          name,
          location
        })
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async updateLibrary(libraryId, name, location) {
      try {
        await axios.patch(`/libraries/${libraryId}`, {
          name,
          location
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
