<template lang="pug">
.panel.is-info
  p.panel-heading Memberships
  a.panel-block(v-if='memberships.length === 0') {{ emptyMessage }}
  RouterLink.panel-block(
    v-else,
    v-for='library in memberships',
    :to='"/libraries/" + library._id',
    :key='library._id',
    :class='{ "is-active": this.isOwnerOfLibrary(library._id) }'
  )
    span.panel-icon
      font-awesome-icon(
        icon='building-columns',
        aria-hidden='true',
        :title='this.isOwnerOfLibrary(library._id) ? "Owner" : "Member"'
      )
    | {{ library.name }}
</template>

<script>
export default {
  name: 'MembershipsPanel',
  props: {
    memberships: {
      type: Array,
      required: true
    },
    ownedLibraries: {
      type: Array,
      required: true
    },
    emptyMessage: {
      type: String,
      default: 'This user is not a member of any libraries.'
    }
  },
  methods: {
    isOwnerOfLibrary(libraryId) {
      return this.ownedLibraries.some((library) => library._id === libraryId)
    }
  }
}
</script>
