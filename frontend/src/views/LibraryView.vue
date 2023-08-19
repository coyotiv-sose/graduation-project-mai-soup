<template lang="pug">
div(v-if="!library") Loading...
div(v-else)
  h1 {{ library.name }}
  p Location: {{ library.latitude }}, {{ library.longitude }}
  p Owner:
    RouterLink(v-if="ownerUsername" :to="{ name: 'user', params: { username: ownerUsername } }") {{ ownerUsername }}
  // if logged in user is not the owner and is not a member, show the join button
  button(v-if="isLoggedIn && ownerUsername !== username && !isUserMember" @click="join") Join
  // if not the owner and is a member, show the leave button
  button(v-if="isLoggedIn && ownerUsername !== username && isUserMember" @click="leave") Leave
  h2 Members
  ul
    li(v-for="member in library.members" :key="member._id")
      RouterLink(:to="{ name: 'user', params: { username: member._id } }") {{ member.username }}
  h2 Books
  ul
    li(v-for="book in library.books" :key="book.isbn")
      RouterLink(:to="{ name: 'book', params: { isbn: book.isbn } }") {{ book.title }}
</template>

<script>
import axios from 'axios'
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { mapState } from 'pinia'

export default {
  name: 'LibraryView',
  data() {
    return {
      library: null // init with null for clearer conditional checks
    }
  },
  components: {
    RouterLink
  },
  computed: {
    ownerUsername() {
      return this.library.owner ? this.library.owner.username : null
    },
    ...mapState(useAccountStore, ['isLoggedIn', 'username']),
    isUserMember() {
      return (
        this.library &&
        this.library.members.some((member) => member.username === this.username)
      )
    }
  },
  async mounted() {
    const response = await axios.get(`/libraries/${this.$route.params.id}`)
    this.library = response.data
  },
  methods: {
    async join() {
      await axios.post(`/libraries/${this.$route.params.id}/members`)
      this.library.members.push({ _id: this.username, username: this.username })
    },
    async leave() {
      await axios.patch(`/libraries/${this.$route.params.id}/members`, {
        remove: true
      })
      this.library.members = this.library.members.filter(
        (member) => member.username !== this.username
      )
    }
  }
}
</script>
