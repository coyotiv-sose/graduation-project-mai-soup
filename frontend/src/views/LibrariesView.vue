<template lang="pug">
h1 Libraries
  // link to create a new library
  RouterLink(to="/libraries/create") Create New Library
  // for each library in libraries, display a link to the library's page
  ul
    li(v-for="library in libraries" :key="library.id")
      RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
</template>

<script>
import axios from 'axios'
import { RouterLink } from 'vue-router'

export default {
  name: 'LibrariesView',
  data() {
    return {
      libraries: []
    }
  },
  components: {
    RouterLink
  },
  async mounted() {
    const response = await axios.get('/libraries')
    this.libraries = response.data
  }
}
</script>
