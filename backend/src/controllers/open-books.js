const axios = require('axios')
const createError = require('http-errors')

module.exports.getOpenLibraryVolumesByQuery = async (req, res, next) => {
  const query = req.query.q

  if (!query) return next(createError(400, 'Missing query'))

  const response = (
    await axios.get(`https://openlibrary.org/search.json?q=${query}&limit=20`)
  ).data.docs

  if (!response.length) return next(createError(404, 'No results found'))

  const results = response.map(book => ({
    title: book.title,
    authors: book.author_name?.join(', ') || null,
    id: book.key.replace('/works/', ''),
    coverUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
  }))

  return res.send(results)
}
