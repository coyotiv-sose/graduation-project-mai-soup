<template lang="pug">
.container
  div(v-if="!user") Loading...
  div(v-else)
    h1 {{ user.username }}
    h2 Memberships
    ul
      li(v-for="library in user.memberships" :key="library._id")
        RouterLink(:to="{ name: 'single-library', params: { id: library._id } }") {{ library.name }}
</template>

<script>
import { useProfileHandler } from '../stores/profile-handler'
import { mapActions } from 'pinia'

export default {
  name: 'ProfileView',
  data() {
    return {
      user: null
    }
  },
  methods: {
    ...mapActions(useProfileHandler, ['fetchProfile']),
  },
  async mounted() {
    this.user = await this.fetchProfile(this.$route.params.username)
  },
}
</script>