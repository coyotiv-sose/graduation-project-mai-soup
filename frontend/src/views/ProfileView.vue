<template lang="pug">
.container
  div(v-if='!user') Loading...
  div(v-else)
    h1.title {{ user.username }}
    MembershipsPanel(
      :memberships='user.memberships',
      :ownedLibraries='user.ownedLibraries'
    )
</template>

<script>
import { RouterLink } from 'vue-router'
import { useProfileHandler } from '../stores/profile-handler'
import { mapActions } from 'pinia'
import MembershipsPanel from '../components/MembershipsPanel.vue'

export default {
  name: 'ProfileView',
  components: {
    RouterLink,
    MembershipsPanel
  },
  data() {
    return {
      user: null
    }
  },
  async mounted() {
    this.user = await this.fetchProfile(this.$route.params.username)
  },
  methods: {
    ...mapActions(useProfileHandler, ['fetchProfile'])
  }
}
</script>
