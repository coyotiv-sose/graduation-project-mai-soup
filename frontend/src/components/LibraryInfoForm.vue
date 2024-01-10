<template lang="pug">
div(v-if="this.action !== 'edit' || library")
  form(@submit.prevent="doSubmit")
    div.form-group
      label(for="name") Name
      input#name(type="text" v-model="name")
      small(v-if="nameError") {{ nameError }}
    div.form-group
      label(for="location") Location
      input#location(type="text" v-model="location")
    div.form-group(v-if="this.action !== 'edit'")
      label(for="file") Image
      input#file(type="file" @change="updateFile" accept="image/gif, image/jpeg, image/png")
    button(type="submit" :disabled="shouldDisableSubmit") Submit
div(v-else aria-busy="true") Loading...
</template>

<script>
import axios from 'axios'
import { useAccountStore } from '../stores/account'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions } from 'pinia'

export default {
  name: 'LibraryInfoForm',
  data() {
    return {
      name: '',
      location: '',
      nameError: null,
      library: null,
      file: null
    }
  },
  props: ['action', 'libraryId'],
  computed: {
    shouldDisableSubmit() {
      return !this.name || this.nameError || !this.location
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLibrarianHandler, ['updateLibrary']),
    // TODO: for some reason only worked outside of pinia,
    // otherwise the file passsed was just an empty object??
    // im sorry i know this should be in the handler
    async createLibrary(name, location, file) {
      const data = new FormData()
      data.append('name', name)
      data.append('location', location)
      data.append('file', file)
      try {
        const response = await axios.post('/libraries', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } catch (error) {
        // TODO: handle error
        console.error(error)
      }
    },
    async doSubmit() {
      let id
      console.log(this.file)

      if (this.action === 'edit') {
        id = this.$route.params.id
        await this.updateLibrary(id, this.name, this.location)
      } else {
        const { _id } = await this.createLibrary(
          this.name,
          this.location,
          this.file
        )
        id = _id
      }

      await this.fetchUser()
      this.$router.push({ name: 'single-library', params: { id } })
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
    updateFile(evt) {
      this.file = evt.target.files[0]
    }
  },
  async mounted() {
    if (this.action === 'edit') {
      this.library = (await axios.get(`/libraries/${this.libraryId}`)).data
      this.name = this.library.name
      this.location = this.library.location
    }
  },
  watch: {
    name(value) {
      this.name = value
      this.validateName(value)
    }
  }
}
</script>
