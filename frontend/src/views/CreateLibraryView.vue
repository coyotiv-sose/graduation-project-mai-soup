<template lang="pug">
h1 Create Library
// form to create a new library. libraries have a name, latitude, longitude.
form(@submit.prevent="doCreateLibrary")
  label(for="name") Name
  input#name(type="text" v-model="name")
  label(for="latitude") Latitude
  input#latitude(type="number" v-model="latitude")
  label(for="longitude") Longitude
  input#longitude(type="number" v-model="longitude")
  button(type="submit") Create Library
</template>

<script>
import axios from 'axios'
import { useAccountStore } from '../stores/account'
import { mapActions } from 'pinia'

export default {
  name: 'CreateLibraryView',
  data() {
    return {
      name: '',
      latitude: 0,
      longitude: 0
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    async doCreateLibrary() {
      const response = await axios.post('/libraries', {
        name: this.name,
        latitude: this.latitude,
        longitude: this.longitude
      })
      await this.fetchUser()
      this.$router.push({ name: 'library', params: { id: response.data._id } })
    }
  }
}
</script>
