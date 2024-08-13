<template lang="pug">
.container
  div(v-if="!library") Loading...
  div(v-else)
    h1 {{ library.name }}
    p Location: {{ library.location }}
    SingleLibraryMap(:coordinates="library.geometry.coordinates", :libraryName="library.name")
    p Owner:
      RouterLink(v-if="ownerUsername" :to="{ name: 'profile', params: { username: ownerUsername } }") {{ ownerUsername }}
    //- TODO: add styling to the image
    img(v-if="imgSrc" :src="imgSrc")
    // if logged in user is not the owner and is not a member, show the join button
    button(v-if="isLoggedIn && !isOwner && !isUserMember" @click="join") Join
    // if not the owner and is a member, show the leave button
    button(v-if="isLoggedIn && !isOwner && isUserMember" @click="leave") Leave
    // if is the owner, show management buttons
    div(v-if="isLoggedIn && isOwner")
      RouterLink(:to="{name: 'add-book', params: {id: this.$route.params.id}}") Add New Book
      br
      RouterLink(:to="{name: 'edit-library', params: {id: this.$route.params.id}}") Edit Library
      br
      a(@click="handleDeletion") Delete Library
    h2 Members
    ul
      li(v-for="member in library.members" :key="member._id")
        RouterLink(:to="{ name: 'profile', params: { username: member.username } }") {{ member.username }}
    h2 Comments 
    form(@submit.prevent="doAddComment" v-if="isUserMember")
      textarea(v-model="commentText" placeholder="Write a comment...")
      button(type="submit") Submit
    p(v-if="!comments || comments === []") No comments yet.
    ul
      li(v-for="comment in comments" :key="comment._id")
        p {{ comment.content }}
        div.grid
          em by {{  comment.author.username }}
          button(v-if="isLoggedIn && comment.author.username === this.username" @click="doDeleteComment(comment._id)") Delete
          //- empty div to make the grid 3 columns in pico's system
          div 

    h2 Books
    table
      thead
        tr
          th Title
          th Status
          th(v-if="isLoggedIn && isUserMember") Action
      tbody
        tr(v-for="book in library.books" :key="book._id")
          td
            RouterLink(:to="{ name: 'single-book', params: { id: book._id } }") {{ book.title }}
            p by {{ book.authors }}
          td
            span(v-if="book.status === 'borrowed'") Borrowed by {{ book.borrower.username }} until {{ book.returnDate }}
            span(v-else) {{ book.status }}
          td(v-if="isLoggedIn && isUserMember")
            div
              button(v-if="book.status === 'available'" @click="doBorrowOrReturn(book)") Borrow
              button(v-if="book.status === 'borrowed' && book.borrower.username === this.username" @click="doBorrowOrReturn(book)") Return
              button(v-if="isOwner" @click="doRemoveBook(book)") Remove from library
</template>

<script>
import { RouterLink } from 'vue-router'
import { useAccountStore } from '../stores/account'
import { useLibraryHandler } from '../stores/library-handler'
import { useLoansHandler } from '../stores/loans-handler'
import { useLibrarianHandler } from '../stores/librarian-handler'
import { mapActions, mapState } from 'pinia'
import SingleLibraryMap from '../components/SingleLibraryMap.vue'
import useApiRequests from '../composables/useApiRequests'

export default {
  name: 'SingleLibraryView',
  setup() {
    const { del } = useApiRequests()
    return { del }
  },
  data() {
    return {
      library: null, // init with null for clearer conditional checks
      comments: null,
      imgSrc: null,
      commentText: ''
    }
  },
  components: {
    RouterLink,
    SingleLibraryMap
  },
  computed: {
    ...mapState(useAccountStore, ['isLoggedIn']),
    ownerUsername() {
      return this.library.owner ? this.library.owner.username : null
    },
    ...mapState(useAccountStore, ['isLoggedIn', 'username']),
    isUserMember() {
      return (
        this.library &&
        this.library.members.some((member) => member.username === this.username)
      )
    },
    isOwner() {
      return this.isOwnerOfLibrary(this.library._id)
    }
  },
  async mounted() {
    const { library, comments } = await this.fetchLibrary(this.$route.params.id)
    this.library = library
    this.comments = comments
    this.imgSrc = this.library.image
      ? `data:${this.library.image.filetype};base64,${this.library.image.data}`
      : null
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useLibraryHandler, [
      'fetchLibrary',
      'joinLibrary',
      'leaveLibrary',
      'addComment',
      'deleteComment'
    ]),
    ...mapActions(useLoansHandler, ['borrowBook', 'returnBook']),
    ...mapActions(useAccountStore, ['isOwnerOfLibrary']),
    ...mapActions(useLibrarianHandler, ['removeBook', 'deleteLibrary']),
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
        await this.returnBook(this.library._id, book._id)
      } else {
        await this.borrowBook(this.library._id, book._id)
      }
      this.library = await this.fetchLibrary(this.$route.params.id)
      this.fetchUser()
    },
    async doRemoveBook(book) {
      await this.removeBook({
        libraryId: this.$route.params.id,
        bookId: book._id
      })

      this.library.books = this.library.books.filter((b) => b._id !== book._id)
    },
    async doAddComment() {
      await this.addComment(this.$route.params.id, this.commentText)
      this.commentText = ''
      const { library, comments } = await this.fetchLibrary(
        this.$route.params.id
      )
      this.library = library
      this.comments = comments
    },
    async doDeleteComment(commentId) {
      await this.deleteComment(this.$route.params.id, commentId)
      const { library, comments } = await this.fetchLibrary(
        this.$route.params.id
      )
      this.library = library
      this.comments = comments
    },
    async handleDeletion() {
      if (confirm('Are you sure you want to delete this library?')) {
        await this.del(`/libraries/${this.$route.params.id}`)
        this.$router.push({ name: 'all-libraries' })
      }
    }
  }
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
