<template lang="pug">
.container
  h1 Edit Library
  // TODO: prevent form submission altogether if validation fails, not just through button
  div(v-if="library")
    form(@submit.prevent="doEditLibrary")
      div.form-group
        label(for="name") Name
        input#name(type="text" v-model="name")
        small(v-if="nameError") {{ nameError }}
      div.form-group
        label(for="location") Location
        input#location(type="text" v-model="location")
      button(type="submit" :disabled="shouldDisableSubmit") Update Library
  div(v-else aria-busy="true") Loading...
</template>
  
  <script>
  import axios from 'axios'
  import { useAccountStore } from '../stores/account'
  import { mapActions } from 'pinia'
  
  export default {
    name: 'EditLibraryView',
    data() {
      return {
        name: '',
        location: '',
        nameError: null,
        library: null,
      }
    },
    computed: {
      shouldDisableSubmit() {
        return !this.name || this.nameError || !this.location
      }
    },
    methods: {
      ...mapActions(useAccountStore, ['fetchUser']),
      async doEditLibrary() {
        const response = await axios.patch(`/libraries/${this.$route.params.id}`, {
          name: this.name,
          location: this.location
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
    },
    async mounted() {
      this.library = (await axios.get(`/libraries/${this.$route.params.id}`)).data
      this.name = this.library.name
      this.location = this.library.location
    },
    watch: {
      name(value) {
        this.name = value
        this.validateName(value)
      },
    }
  }
  </script>
  