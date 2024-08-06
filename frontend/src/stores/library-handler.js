import { defineStore } from 'pinia'
import axios from 'axios'
import useApiRequests from '../composables/useApiRequests'

export const useLibraryHandler = defineStore('library-handler', {
  actions: {
    // Immediately Invoked Function Expression (IIFE) to set up API request methods
    // the IIFE allows to initialize the `get` method from the `useApiRequests` composable only once
    // and then use them in the store actions without repeating the initialization code
    ...(() => {
      const { get, post, patch } = useApiRequests()
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
          await post(`/libraries/${libraryId}/members`)
        },
        async leaveLibrary(libraryId) {
          await patch(`/libraries/${libraryId}/members`, {
            remove: true
          })
        }
      }
    })()
  }
})
