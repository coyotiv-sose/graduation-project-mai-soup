import { defineStore } from 'pinia'
import axios from 'axios'
import useApiRequests from '../composables/useApiRequests'

export const useProfileHandler = defineStore('profile-handler', {
  actions: {
    ...(() => {
      const { get } = useApiRequests()
      return {
        async fetchProfile(username) {
          const profile = await get(`/users/${username}`)
          return profile
        }
      }
    })()
  }
})
