<template lang="pug">
.container
  h1 Libraries
    // link to create a new library
    RouterLink(to="/libraries/create") Create New Library
    AllLibrariesMap(v-if="this.longitude && this.latitude" :libraries="this.libraries" :longitude="this.longitude" :latitude="this.latitude")
    div(v-if="this.user")
      h2 Owned Libraries
      ul
        li(v-for="library in this.user.ownedLibraries" :key="library.id")
          RouterLink(:to="{ name: 'single-library', params: { id: library._id } }") {{ library.name }}
      h2 Memberships
      ul
        li(v-for="library in this.user.memberships" :key="library.id")
          RouterLink(:to="{ name: 'single-library', params: { id: library._id } }") {{ library.name }}
    h2 All Libraries
    ul
      li(v-for="library in libraries" :key="library.id")
        RouterLink(:to="{ name: 'single-library', params: { id: library._id } }") {{ library.name }}
</template>

<script>
import { RouterLink } from 'vue-router'
import AllLibrariesMap from '../components/AllLibrariesMap.vue'
import { mapActions, mapState } from 'pinia'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'

export default {
  name: 'AllLibrariesView',
  data() {
    return {
      libraries: [],
      longitude: null,
      latitude: null,
    }
  },
  computed: {
    ...mapState(useAccountStore, ['user'])
  },
  components: {
    RouterLink,
    AllLibrariesMap
  },
  async mounted() {
    this.libraries = (await this.fetchAllLibraries())

    const onGeoSuccess = (position) => {
      this.latitude  = position.coords.latitude
      this.longitude = position.coords.longitude
    }

    const onGeoFailure = () => {
      // set to middle of germany because why not
      this.longitude = 10.4515
      this.latitude = 51.1657
    }

    // open perms popup
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFailure)
  },
  methods: {
    ...mapActions(useLibraryHandler, ['fetchAllLibraries'])
  }
}
</script>
