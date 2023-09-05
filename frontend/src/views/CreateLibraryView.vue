<template lang="pug">
.container
  h1 Create Library
  // TODO: prevent form submission altogether if validation fails, not just through button
  form(@submit.prevent="doCreateLibrary")
    div.form-group
      label(for="name") Name
      input#name(type="text" v-model="name")
      small(v-if="nameError") {{ nameError }}
    div.form-group
      label(for="latitude") Latitude
      input#latitude(type="number" v-model="latitude" min="-90" max="90")
      small(v-if="latitudeError") {{ latitudeError }}
    div.form-group
      label(for="longitude") Longitude
      input#longitude(type="number" v-model="longitude" min="-180" max="180")
      small(v-if="longitudeError") {{ longitudeError }}
    button(type="submit" :disabled="shouldDisableSubmit") Create Library
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
      longitude: 0,
      nameError: null,
      latitudeError: null,
      longitudeError: null
    }
  },
  computed: {
    shouldDisableSubmit() {
      return !this.name || this.nameError || !this.latitude || this.latitudeError || !this.longitude || this.longitudeError
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
    },
    validateName(name) {
      if (!name) {
        this.nameError = 'Name is required'
        return
      }
      if (name.length < 5) {
        this.nameError = 'Name must be at least 5 characters'
        return
      }
      if (name.length > 40) {
        this.nameError = 'Name cannot exceed 40 characters'
        return
      }

      this.nameError = null
    },
    validateLatitude(latitude) {
      if (latitude < -90 || latitude > 90) {
        this.latitudeError = 'Latitude must be between -90 and 90'
        return
      }

      this.latitudeError = null
    },
    validateLongitude(longitude) {
      if(longitude < -180 || longitude > 180) {
        this.longitudeError = 'Longitude must be between -180 and 180'
        return
      }

      this.longitudeError = null
    },
  },
  watch: {
    name(value) {
      this.name = value
      this.validateName(value)
    },
    latitude(value) {
      this.latitude = value
      this.validateLatitude(value)
    },
    longitude(value) {
      this.longitude = value
      this.validateLongitude(value)
    }
  }
}
</script>
