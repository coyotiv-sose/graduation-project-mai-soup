import { defineStore } from 'pinia'
import axios from 'axios'

export const useProfileHandler = defineStore('profile-handler', {
  actions: {
    async fetchProfile(username) {
      try {
        const response = await axios.get(`/users/${username}`)
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    }
  }
})
