<template lang="pug">
#map
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default {
  name: 'AllLibrariesMap',
  props: ['libraries', 'longitude', 'latitude'],
  data() {
    return {
      mbxToken: import.meta.env.VITE_MAPBOX_TOKEN,
      popupComponents: []
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
        center: [this.longitude, this.latitude],
        zoom: 8
      })

      // library markers
      this.libraries.forEach((library) => {
        const popup = new mapboxgl.Popup({ offset: 24, closeButton: false })
          .setLngLat(library.geometry.coordinates)
          .setHTML(`<a href="/libraries/${library._id}">${library.name}</a>`)
          .addTo(map)

        new mapboxgl.Marker({ color: 'blue' })
          .setLngLat(library.geometry.coordinates)
          // TODO: some pico styles are interfering with the marker. fix.
          .setPopup(popup)
          .addTo(map)
      })

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
