<template lang="pug">
.container
  div(v-if="!user") Loading...
  div(v-else)
    h1.title {{ user.username }}
    .panel.is-info
      p.panel-heading Memberships
      a.panel-block(v-if="user.memberships.length === 0") This user is not a member of any libraries.
      RouterLink.panel-block(v-else v-for='library in user.memberships' :to="'/libraries/' + library._id" :key='library._id' :class="{ 'is-active': this.isOwnerOfLibrary(library._id) }")
        span.panel-icon
          font-awesome-icon(icon="building-columns" aria-hidden="true" :title="this.isOwnerOfLibrary(library._id) ? 'Owner' : 'Member'")
        | {{ library.name }}
</template>

<script>
import { RouterLink } from 'vue-router'
import { useProfileHandler } from '../stores/profile-handler'
import { mapActions } from 'pinia'

export default {
  name: 'ProfileView',
  components: {
    RouterLink
  },
  data() {
    return {
      user: null
    }
  },
  methods: {
    ...mapActions(useProfileHandler, ['fetchProfile']),
    isOwnerOfLibrary(libraryId) {
      console.log('looking for libraryId', libraryId)
      console.log('user.ownedLibraries', this.user.ownedLibraries)
      return this.user.ownedLibraries.some((lib) => lib._id === libraryId)
    }
  },
  async mounted() {
    this.user = await this.fetchProfile(this.$route.params.username)
  }
}
</script>
