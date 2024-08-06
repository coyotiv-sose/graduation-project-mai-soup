import '@picocss/pico/css/pico.min.css'
import './assets/main.css'
// TODO: make own css for toasts
import 'vue-toastification/dist/index.css'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'

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

import { useAccountStore } from './stores/account'

const accountStore = useAccountStore()

const toastOptions = {
  position: 'bottom-center',
  maxToasts: 5,
  closeButton: false
}

// has to be a promise to avoid top-level async/await, which is not
// supported by older browsers
accountStore.fetchUser().then(() => {
  app.use(router)
  app.use(Toast, toastOptions)
  app.mount('#app')
})
