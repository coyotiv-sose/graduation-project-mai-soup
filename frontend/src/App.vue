<template lang="pug">
MainNavbar
//- if current view is home, don't wrap in main container
main.container(v-if='$route.name !== "home"')
  RouterView
RouterView(v-else)
</template>

<script>
import { RouterView } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'

export default {
  components: {
    RouterView,
    MainNavbar
  }
}
</script>
