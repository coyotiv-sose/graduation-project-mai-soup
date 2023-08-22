<script>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { useAccountStore } from './stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn', 'username'])
  },
  components: {
    RouterLink,
    RouterView,
    HelloWorld
  },
  methods: {
    ...mapActions(useAccountStore, ['logout', 'fetchUser']),
    async doLogout() {
      await this.logout()
    }
  },
  mounted() {
    this.fetchUser()
  }
}
</script>

<template>
  <header class="navbar">
    <nav class="nav-items">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/users">Users</RouterLink>
      <RouterLink to="/libraries">Libraries</RouterLink>
      <RouterLink to="/books">Books</RouterLink>
      <RouterLink v-if="isLoggedIn" to="/loans">Loans</RouterLink>
      <RouterLink v-if="!isLoggedIn" to="/login">Login</RouterLink>
      <RouterLink v-if="!isLoggedIn" to="/signup">Sign Up</RouterLink>
    </nav>

    <div v-if="isLoggedIn" class="user-info">
      <span>Hello, {{ username }}!</span>
      <button @click="doLogout">Logout</button>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
/* TODO: add proper styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-items {
  display: flex;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
</style>
