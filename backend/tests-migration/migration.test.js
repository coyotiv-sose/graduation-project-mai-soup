const Book = require('../src/models/book')
const User = require('../src/models/user')

const moonBookParams = {
  title: 'Moon',
  authors: ['Person One', 'Another Person'],
  returnDate: new Date('2024-08-23'),
}

const starBookParams = {
  title: 'Star',
  authors: ['Another Person', 'Person Two'],
  returnDate: new Date('2024-07-14'),
}

describe('book model migration tests', () => {
  describe('user validation', () => {
    let users

    beforeAll(async () => {
      users = await User.find()
    })

    it('should have exactly three users after migration', () => {
      expect(users.length).toBe(3)
    })

    it('should correctly migrate Alice', () => {
      const alice = users.find(user => user.username === 'Alice')
      expect(alice).toBeDefined()
      expect(alice.ownedLibraries.length).toBe(1)
      expect(alice.ownedLibraries[0].name).toBe('Library One')
      expect(alice.memberships.length).toBe(1)
      expect(alice.memberships[0].name).toBe('Library One')
      expect(alice.loans).toEqual([])
    })

    it('should correctly migrate Bob', () => {
      const bob = users.find(user => user.username === 'Bob')
      expect(bob).toBeDefined()
      expect(bob.ownedLibraries).toEqual([])
      expect(bob.memberships.length).toBe(2)
      expect(
        bob.memberships.some(member => member.name === 'Library One')
      ).toBe(true)
      expect(
        bob.memberships.some(member => member.name === 'Library Two')
      ).toBe(true)
      console.log('Bob:', bob)
      expect(bob.loans.length).toBe(2)
      expect(bob.loans.some(loan => loan.title === moonBookParams.title)).toBe(
        true
      )
      expect(bob.loans.some(loan => loan.title === starBookParams.title)).toBe(
        true
      )
    })

    it('should correctly migrate Charlie', () => {
      const charlie = users.find(user => user.username === 'Charlie')
      expect(charlie).toBeDefined()
      expect(charlie.ownedLibraries.length).toBe(1)
      expect(charlie.ownedLibraries[0].name).toBe('Library Two')
      expect(charlie.memberships.length).toBe(2)
      expect(
        charlie.memberships.some(library => library.name === 'Library One')
      ).toBe(true)
      expect(
        charlie.memberships.some(library => library.name === 'Library Two')
      ).toBe(true)
      expect(charlie.loans).toEqual([])
    })
  })

  describe('book validation', () => {
    let books

    beforeAll(async () => {
      books = await Book.find()
    })

    it('should have exactly three books after migration', () => {
      expect(books.length).toBe(3)
    })

    it('should not have any openLibraryId or bookInfo fields', () => {
      books.forEach(book => {
        expect(book.openLibraryId).toBeUndefined()
        expect(book.bookInfo).toBeUndefined()
      })
    })
  })
})
