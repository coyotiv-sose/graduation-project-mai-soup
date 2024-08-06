import { defineStore } from 'pinia'
import axios from 'axios'
import useApiRequests from '../composables/useApiRequests'

export const useLibraryHandler = defineStore('library-handler', {
  actions: {
    // Immediately Invoked Function Expression (IIFE) to set up API request methods
    // the IIFE allows to initialize the `get` method from the `useApiRequests` composable only once
    // and then use them in the store actions without repeating the initialization code
    ...(() => {
      const { get } = useApiRequests()
      return {
        async fetchAllLibraries() {
          const libraries = await get('/libraries')
          return libraries
        },
        async fetchLibrary(libraryId) {
          const libraries = await get(`/libraries/${libraryId}`)
          return libraries
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
    })()
  }
})
