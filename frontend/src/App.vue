<template lang="pug">
MainNavbar
RouterView
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
