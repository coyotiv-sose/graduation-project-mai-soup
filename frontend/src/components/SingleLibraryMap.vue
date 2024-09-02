<template lang="pug">
article#map
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default {
  name: 'SingleLibraryMap',
  props: ['coordinates', 'libraryName'],
  data() {
    return {
      mbxToken: import.meta.env.VITE_MAPBOX_TOKEN
    }
  },
  mounted() {
    this.setupMap()
  },
  methods: {
    setupMap() {
      mapboxgl.accessToken = this.mbxToken
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: this.coordinates,
        zoom: 14
      })

      // library marker
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(this.coordinates)
        // TODO: some pico styles are interfering with the popup. fix.
        .setPopup(
          new mapboxgl.Popup({ offset: 24 }).setHTML(
            `<strong>${this.libraryName}</strong>`
          )
        )
        .addTo(map)

      map.addControl(new mapboxgl.NavigationControl())
    }
  }
}
</script>

<style scoped lang="scss">
#map {
  height: 400px;
}
</style>
