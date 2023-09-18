<template lang="pug">
.container
  div(v-if="!library") Loading...
  div(v-else)
    h1 {{ library.name }}
    p Location: {{ library.location }}
    SingleLibraryMap(:coordinates="library.geometry.coordinates", :libraryName="library.name")
    p Owner:
      RouterLink(v-if="ownerUsername" :to="{ name: 'profile', params: { username: ownerUsername } }") {{ ownerUsername }}
    // if logged in user is not the owner and is not a member, show the join button
    button(v-if="isLoggedIn && ownerUsername !== username && !isUserMember" @click="join") Join
    // if not the owner and is a member, show the leave button
    button(v-if="isLoggedIn && ownerUsername !== username && isUserMember" @click="leave") Leave
    h2 Members
    ul
      li(v-for="member in library.members" :key="member._id")
        RouterLink(:to="{ name: 'profile', params: { username: member.username } }") {{ member.username }}
    h2 Books
    ul
      li(v-for="book in library.books" :key="book._id")
        div.grid
          RouterLink(:to="{ name: 'book', params: { id: book.bookInfo.openLibraryId } }" :class="book.status === 'available' ? 'available' : 'unavailable'") {{ book.bookInfo.title }}
          button(v-if="isUserMember && book.status === 'available'" @click="doBorrowOrReturn(book)") Borrow
          button(v-if="isUserMember && book.status === 'borrowed' && book.borrower.username === this.username" @click="doBorrowOrReturn(book)") Return
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'
import { mapActions, mapState } from 'pinia'
import SingleLibraryMap from '../components/SingleLibraryMap.vue'

export default {
  name: 'LibraryView',
  data() {
    return {
      library: null, // init with null for clearer conditional checks
    }
  },
  components: {
    RouterLink,
    SingleLibraryMap
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
    this.library = await this.fetchLibrary(this.$route.params.id)
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLibraryHandler, ['fetchLibrary', 'borrowCopy', 'returnCopy',
      'joinLibrary', 'leaveLibrary']),
    async join() {
      await this.joinLibrary(this.$route.params.id)
      this.library.members.push({ _id: this.username, username: this.username })
      this.fetchUser()
    },
    async leave() {
      await this.leaveLibrary(this.$route.params.id)
      this.library.members = this.library.members.filter(
        (member) => member.username !== this.username
      )
      this.fetchUser()
    },
    async doBorrowOrReturn(book) {
      if (book.status === 'borrowed') {
        await this.returnCopy(this.library._id, book._id)
      } else {
        await this.borrowCopy(this.library._id, book._id)
      }
      this.library = await this.fetchLibrary(this.$route.params.id)
      this.fetchUser()
    },
  },
}
</script>

<style scoped lang="scss">
.available {
  color: green;
}

.unavailable {
  color: red;
  text-decoration: line-through;
}
</style>
