<template lang="pug">
.bg
  div
  .hero
    .hero-body
      p.title.mb-5 Porch Reads Club
      p.subtitle Welcome to your online library hub!
      p.subtitle Simplify book management, connect with members,
        |
        br 
        | and enhance your book lending experience.
      p.subtitle Dive in and explore libraries now!
      RouterLink.button.is-primary(to='/libraries') View Libraries
  footer
    p.mb-5.is-size-5 Maijs Garais, 2024
</template>

<script>
import Navbar from '@/components/Navbar.vue'

export default {
  name: 'HomeView'
}
</script>

<style scoped lang="scss">
$text-color: rgba(255, 255, 255, 0.75);
.bg {
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url('/src/assets/landing-bg.webp');
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  box-shadow: inset 0 0 5rem rgba(0, 0, 0, 0.5);
}
</style>
