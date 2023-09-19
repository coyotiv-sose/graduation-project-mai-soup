import { defineStore } from 'pinia'
import axios from 'axios'

export const useLibraryHandler = defineStore('library-handler', {
  actions: {
    async fetchAllLibraries() {
      try {
        const response = await axios.get('/libraries')
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async fetchLibrary(libraryId) {
      try {
        const response = await axios.get(`/libraries/${libraryId}`)
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async joinLibrary(libraryId) {
      try {
        await axios.post(`/libraries/${libraryId}/members`)
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async leaveLibrary(libraryId) {
      try {
        await axios.patch(`/libraries/${libraryId}/members`, {
          remove: true
        })
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
