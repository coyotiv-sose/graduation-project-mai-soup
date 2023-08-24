<template lang="pug">
h1 Libraries
  // link to create a new library
  RouterLink(to="/libraries/create") Create New Library
  // for each ownedLibrary in current user, display a link to the library's page
  h2 Owned Libraries
  ul
    li(v-for="library in this.user.ownedLibraries" :key="library.id")
      RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
  // for each library in current user's memberships, display a link to the library's page
  h2 Memberships
  ul
    li(v-for="library in this.user.memberships" :key="library.id")
      RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
  // for each library in libraries, display a link to the library's page
  h2 All Libraries
  ul
    li(v-for="library in libraries" :key="library.id")
      RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
</template>

<script>
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { mapState } from 'pinia'
import { useAccountStore } from '../stores/account'

export default {
  name: 'LibrariesView',
  data() {
    return {
      libraries: []
    }
  },
  computed: {
    ...mapState(useAccountStore, ['user'])
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
