<template lang="pug">
.container
  h1.title Add Book to Library
  // TODO: refactor to be same as other forms
  form(v-on:submit.prevent='onSubmit')
    // books have a title, author(s), and optional image to upload
    .field
      .control.has-icons-left
        input.input(type='text', v-model='title', placeholder='Title')
        span.icon.is-small.is-left
          font-awesome-icon(icon='book')
    .field
      .control.has-icons-left
        input.input(type='text', v-model='authors', placeholder='Author(s)')
        span.icon.is-small.is-left
          font-awesome-icon(icon='user-pen')
    //- TODO: add image upload
    //- TODO: add error messages
    .field
      .control
        button.button.is-success(
          type='submit',
          :disabled='shouldPreventSubmission'
        ) Submit
</template>

<script>
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions } from 'pinia'

export default {
  name: 'AddBookView',
  data() {
    return {
      title: '',
      authors: ''
    }
  },
  computed: {
    // TODO: the name of this method should prob be consistent across components
    shouldPreventSubmission() {
      return !this.title || !this.authors
    }
  },
  watch: {
    query(value) {
      this.query = value
      this.validateQuery(value)
    }
  },
  methods: {
    ...mapActions(useLibrarianHandler, ['createBook']),
    async onSubmit() {
      if (this.shouldPreventSubmission) return

      await this.createBook({
        library: this.$route.params.id,
        title: this.title,
        authors: this.authors
      })

      this.$router.push({
        name: 'single-library',
        params: { id: this.$route.params.id }
      })
    }
  }
}
</script>
