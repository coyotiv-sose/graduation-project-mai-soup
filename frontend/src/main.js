import '@picocss/pico/css/pico.min.css'
import './assets/main.css'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(({ store }) => {
  // add router to pinia to be able to detect whether current route
  // after logout needs auth
  store.$router = markRaw(router)
})
app.use(pinia)

app.use(router)

app.mount('#app')
