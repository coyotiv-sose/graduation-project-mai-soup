<template lang="pug">
.grid 
  div
    h2 {{ book.title }} 
    p by {{ book.authors[0] }}
  // TODO: add downsized regular thumbnail if there's no small version
  // TODO: add default image for books that don't have one at all
  img(:src="book.imageLinks?.smallThumbnail" :alt="book.title")
</template>

<script>
export default {
  name: 'BookListItem',
  props: ['book']
}
</script>

<style scoped lang="scss">
.grid {
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6)
}
</style>