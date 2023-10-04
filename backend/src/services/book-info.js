class BookInfoService {
  async addToLibrary(library) {
    const libraryWithId = this.librariesFoundIn.find(
      l => l._id.toString() === library._id.toString()
    )

    if (!libraryWithId) {
      this.librariesFoundIn.push(library)
      await this.save()
    }
  }

  async removeFromLibrary(library) {
    const libraryWithId = this.librariesFoundIn.find(
      l => l._id.toString() === library._id.toString()
    )

    if (!libraryWithId) {
      throw new Error('book is not in this library')
    }

    const index = this.librariesFoundIn.indexOf(libraryWithId)
    this.librariesFoundIn.splice(index, 1)
    await this.save()
  }
}

module.exports = BookInfoService
