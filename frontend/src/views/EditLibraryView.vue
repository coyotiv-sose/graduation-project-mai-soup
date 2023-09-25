<template lang="pug">
.container
  h1 Edit Library
  // TODO: prevent form submission altogether if validation fails, not just through button
  LibraryInfoForm(action="edit" :libraryId="this.$route.params.id")
</template>
  
<script>
import LibraryInfoForm from '../components/LibraryInfoForm.vue'

export default {
  name: 'EditLibraryView',
  components: { LibraryInfoForm }
}
</script>
  