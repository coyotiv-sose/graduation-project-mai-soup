<script setup>
import axios from 'axios'

// TODO: probably makes more sense to send users directly
// instead of wrapping them in an object
const { data: userData } = await axios.get('http://localhost:3000/users?json=true')
const users = userData.users
</script>

<template>
  <main>
    <h1>Users</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.username }}
      </li>
    </ul>
  </main>
</template>
