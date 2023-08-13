<script>
import { useUserStore } from '../stores/user'
import { mapStores } from 'pinia'

export default {
  computed: {
    ...mapStores(useUserStore, ['userStore'])
  }
}
</script>

<template>
  <div class="about">
    <!-- if there is a logged in user, display it. otherwise, say no one is logged in -->
    <h1 v-if="userStore.username">Logged in as {{ userStore.username }}</h1>
    <h1 v-else>No one is logged in</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
