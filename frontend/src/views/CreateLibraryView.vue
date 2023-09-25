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
      label(for="location") Location
      input#location(type="text" v-model="location")
    button(type="submit" :disabled="shouldDisableSubmit") Create Library
</template>

<script>
import { useAccountStore } from '../stores/account'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions } from 'pinia'

export default {
  name: 'CreateLibraryView',
  data() {
    return {
      name: '',
      location: '',
      nameError: null,
    }
  },
  computed: {
    shouldDisableSubmit() {
      return !this.name || this.nameError || !this.location
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLibrarianHandler, ['createLibrary']),
    async doCreateLibrary() {
      const { _id } = await this.createLibrary(this.name, this.location)
      await this.fetchUser()
      this.$router.push({ name: 'single-library', params: { id: _id } })
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
  watch: {
    name(value) {
      this.name = value
      this.validateName(value)
    },
  }
}
</script>
