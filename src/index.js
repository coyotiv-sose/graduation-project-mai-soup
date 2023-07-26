const User = require('./models/user')
const Book = require('./models/book')

function newLine(repeats = 1) {
  console.log('\n'.repeat(repeats))
}

const mai = new User({
  username: 'mai',
  email: 'mai@example.com',
})
const britt = new User({
  username: 'burrito',
  email: 'britt@example.com',
})

const maiShelf = mai.createShelf({
  name: 'mai shelf',
  latitude: 0,
  longitude: 0,
})

console.log('we have two users, mai and britt. mai has a bookshelf.')
console.log({ mai })
console.log({ britt })

newLine(2)

console.log('mai can add a book to his shelf ')
const book = new Book({
  title: 'The Book Thief',
  author: 'Markus Zusak',
  isbn: '9780375842207',
})
maiShelf.addBook(book)
newLine()

console.log(`mai's shelf has ${maiShelf.books.length} books`)
console.log(`mai's shelf has ${maiShelf.subscribers.length} subscribers`)
console.log(`the books on mai's shelf are:
${maiShelf.books.map(b => b.title).join('\n')}`)

newLine(2)

console.log("britt can subscribe to mai's shelf")
britt.subscribeToShelf(maiShelf)
console.log(`mai's shelf has ${maiShelf.subscribers.length} subscribers`)
console.log(
  `britt is subscribed to ${britt.subscribedBookshelves.length} shelves`
)
console.log(`the subscribers of mai's shelf are:
${maiShelf.subscribers.map(u => u.username).join('\n')}`)

newLine(2)

console.log('mai can remove a book from his shelf')
maiShelf.removeBook(book)
console.log(`mai's shelf has ${maiShelf.books.length} books`)
console.log(`the books on mai's shelf are:
${maiShelf.books.map(b => b.title).join('\n') || 'none'}`)
console.log(
  `the shelf britt is subscribed to has ${maiShelf.books.length} books (it's the same shelf!)`
)

newLine(2)

console.log(
  "mai and britt can add multiple books to the shelf they're subscribed to"
)
const book2 = new Book({
  title: 'A Promised Land',
  author: 'Barack Obama',
  isbn: '9781524763169',
})
const book3 = new Book({
  title: 'The Restaurant at the End of the Universe',
  author: 'Douglas Adams',
  isbn: '9780345418920',
})
const book4 = new Book({
  title: 'The Hitchhiker’s Guide to the Galaxy',
  author: 'Douglas Adams',
  isbn: '9780345391803',
})
mai.subscribedBookshelves[0].addBook(book2)
britt.subscribedBookshelves[0].addBook(book3)
britt.subscribedBookshelves[0].addBook(book4)
newLine()
console.log(`the books on mai's shelf are:
${maiShelf.books.map(b => b.title).join('\n')}`)
newLine()
console.log(`the books on the shelf mai is subscribed to are:
${mai.subscribedBookshelves[0].books.map(b => b.title).join('\n')}`)
newLine()
console.log(`the books on the shelf britt is subscribed to are:
${britt.subscribedBookshelves[0].books.map(b => b.title).join('\n')}`)
console.log(`they're the same shelf, so the books added are the same!`)

newLine(2)

console.log('britt can unsubscribe from mai shelf')
newLine()
britt.unsubscribeFromShelf(maiShelf)
console.log(`mai's shelf has ${maiShelf.subscribers.length} subscribers`)
console.log(
  `britt is subscribed to ${britt.subscribedBookshelves.length} shelves`
)
console.log(`the subscribers of mai's shelf are:
${maiShelf.subscribers.map(u => u.username).join('\n')}`)

newLine(2)

console.log('the name of mai shelf can be changed')
maiShelf.name = 'your shelf'
console.log(`mai's shelf is now called ${maiShelf.name}`)
