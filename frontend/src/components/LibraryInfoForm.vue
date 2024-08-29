<template lang="pug">
form(v-if='this.action !== "edit" || library', @submit.prevent='doSubmit')
  .field
    .control.has-icons-left
      input.input(type='text', v-model='name', placeholder='Name')
      span.icon.is-small.is-left
        font-awesome-icon(icon='book')
    p.help.is-danger(v-if='nameError') {{ nameError }}
  .field
    .control.has-icons-left
      input.input(type='text', v-model='location', placeholder='Location')
      span.icon.is-small.is-left
        font-awesome-icon(icon='location-dot')
    p.help.is-danger(v-if='locationError') {{ locationError }}
    p.help.is-warning(v-if='locationWarning') {{ locationWarning }}
  .field
    .control.has-icons-left
      //- TODO: add bulma's custom styling as per https://bulma.io/documentation/form/file/
      input.input(
        type='file',
        @change='updateFile',
        accept='image/gif, image/jpeg, image/png'
      )
      span.icon.is-small.is-left
        font-awesome-icon(icon='image')
  .field
    .control
      button.button.is-success(type='submit', :disabled='shouldDisableSubmit') Submit
p(v-else, aria-busy='true') Loading...
</template>

<script>
import { useAccountStore } from '../stores/account'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions } from 'pinia'
import useApiRequests from '../composables/useApiRequests'

export default {
  name: 'LibraryInfoForm',
  setup() {
    const { get, post } = useApiRequests()
    return { get, post }
  },
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
      return (
        !this.name || this.nameError || !this.location || this.locationError
      )
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
      const response = await this.post('/libraries', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
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
    validateLocation(location) {
      this.locationWarning = null
      this.locationError = null

      if (!location) {
        this.locationError = 'Location is required'
        return
      }

      if (location.split(/[^\w]/).length > 20) {
        this.locationWarning =
          'Locations longer than 20 words will be truncated when looking up coordinates'

        return
      }

      if (location.length > 256) {
        this.locationWarning =
          'Locations longer than 256 characters will be truncated when looking up coordinates'
        return
      }
    },
    updateFile(evt) {
      this.file = evt.target.files[0]
    }
  },
  async mounted() {
    if (this.action === 'edit') {
      this.library = await this.get(`/libraries/${this.libraryId}`)
      this.name = this.library.name
      this.location = this.library.location
    }
  },
  watch: {
    name(value) {
      this.name = value
      this.validateName(value)
    },
    location(value) {
      this.location = value
      this.validateLocation(value)
    }
  }
}
</script>
