import { defineStore } from 'pinia'
import useApiRequests from '../composables/useApiRequests'

export const useLibraryHandler = defineStore('library-handler', {
  actions: {
    // Immediately Invoked Function Expression (IIFE) to set up API request methods
    // the IIFE allows to initialize the `get` method from the `useApiRequests` composable only once
    // and then use them in the store actions without repeating the initialization code
    ...(() => {
      const { get, post, patch, del } = useApiRequests()
      return {
        async fetchAllLibraries() {
          const libraries = await get('/libraries')
          return libraries
        },
        async fetchLibrary(libraryId) {
          const library = await get(`/libraries/${libraryId}`)
          const comments = await get(`/libraries/${libraryId}/comments`)
          return { library, comments }
        },
        async joinLibrary(libraryId) {
          await post(`/libraries/${libraryId}/members`)
        },
        async leaveLibrary(libraryId) {
          await patch(`/libraries/${libraryId}/members`, {
            remove: true
          })
        },
        async addComment(libraryId, content) {
          await post(`/libraries/${libraryId}/comments`, { content })
        },
        async deleteComment(libraryId, commentId) {
          await del(`/libraries/${libraryId}/comments/${commentId}`)
        }
      }
    })()
  }
})
