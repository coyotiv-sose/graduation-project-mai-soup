<template lang="pug">
h1.title Libraries
// TODO: loading indicator
.fixed-grid.has-1-cols-mobile.has-2-cols(v-if='libraries')
  .grid
    .cell
      AllLibrariesMap(
        v-if='this.longitude && this.latitude',
        :libraries='this.libraries',
        :longitude='this.longitude',
        :latitude='this.latitude'
      )
    .cell
      MembershipsPanel(
        :memberships='this.user.memberships',
        :ownedLibraries='this.user.ownedLibraries',
        emptyMessage='You are not yet a member of any libraries.'
      )
section.grid.is-col-min-12
  .cell(v-for='library in this.libraries', :key='library.id')
    article.card
      .card-image(v-if='library.image')
        figure.figure.image.is-5by3
          img.library-card-image(
            :src='base64ToImage(library.image)',
            :alt='library.name'
          )
      .card-content
        RouterLink.title(
          :to='{ name: "single-library", params: { id: library._id } }'
        ) {{ library.name }}
        p.subtitle {{ library.location }}
        p {{ library.description }}
      .card-footer
        RouterLink.card-footer-item(
          :to='{ name: "single-library", params: { id: library._id } }'
        ) View {{ library.name }}
</template>

<script>
import { RouterLink } from 'vue-router'
import AllLibrariesMap from '../components/AllLibrariesMap.vue'
import MembershipsPanel from '../components/MembershipsPanel.vue'
import { mapActions, mapState } from 'pinia'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'

export default {
  name: 'AllLibrariesView',
  components: {
    RouterLink,
    AllLibrariesMap,
    MembershipsPanel
  },
  data() {
    return {
      libraries: [],
      longitude: null,
      latitude: null
    }
  },
  computed: {
    ...mapState(useAccountStore, ['user'])
  },
  async mounted() {
    this.libraries = await this.fetchAllLibraries()

    const onGeoSuccess = (position) => {
      this.latitude = position.coords.latitude
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
    ...mapActions(useLibraryHandler, ['fetchAllLibraries']),
    base64ToImage(imageData) {
      if (!imageData) return null
      return `data:${imageData.filetype};base64,${imageData.data}`
    }
  }
}
</script>
