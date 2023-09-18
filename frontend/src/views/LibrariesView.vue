<template lang="pug">
.container
  h1 Libraries
    // link to create a new library
    RouterLink(to="/libraries/create") Create New Library
    div(v-if="this.user")
      h2 Owned Libraries
      ul
        li(v-for="library in this.user.ownedLibraries" :key="library.id")
          RouterLink(:to="{ name: 'owned-library', params: { id: library._id } }") {{ library.name }}
      h2 Memberships
      ul
        li(v-for="library in this.user.memberships" :key="library.id")
          RouterLink(:to="{ name: 'library', params: { id: library._id } }") {{ library.name }}
    h2 All Libraries
    ul
      li(v-for="library in libraries" :key="library.id")
        RouterLink(:to="{ name: library.owner.username === this.user?.username ? 'owned-library' : 'library', params: { id: library._id } }") {{ library.name }}
</template>

<script>
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { mapActions, mapState } from 'pinia'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'

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
    this.libraries = (await this.fetchAllLibraries())
  },
  methods: {
    ...mapActions(useLibraryHandler, ['fetchAllLibraries'])
  }
}
</script>
