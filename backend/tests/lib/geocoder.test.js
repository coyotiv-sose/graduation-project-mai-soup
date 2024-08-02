const {
  getGeometryOfLocation,
  cleanUpInput,
} = require('../../src/lib/geocoder')

// The search text should be expressed as a URL-encoded UTF-8 string, and
// must not contain the semicolon character (either raw or URL-encoded).
// Your search text, once decoded, must consist of at most 20 words
// and numbers separated by spacing and punctuation, and at most 256 characters.
// semicolons should be stripped and not throw an error,
// any text too long is trimmed and should not throw an error

it('should return a geometry object', async () => {
  const location = '12345'
  const geometry = await getGeometryOfLocation(location)
  expect(geometry).toBeDefined()
  expect(geometry.type).toBe('Point')
  expect(geometry.coordinates).toBeDefined()
})

it('should strip semicolons', () => {
  const input = '12345;67890'
  const output = cleanUpInput(input)
  expect(output).toBe('1234567890')
})

it('should trim to 256 characters', () => {
  const input = 'a'.repeat(257)
  const output = cleanUpInput(input)
  expect(output).toBe('a'.repeat(256))
})

it('should trim to 20 words separated by spacing and punctuation', () => {
  const input = 'a b c,d e!f g?h i j k l m n o p q r s t u v w x y z'
  const output = cleanUpInput(input)
  expect(output).toBe(
    'a%20b%20c%20d%20e%20f%20g%20h%20i%20j%20k%20l%20m%20n%20o%20p%20q%20r%20s%20t'
  )
})

it('should url encode spaces and punctuation', () => {
  const input = 'Minneapolis, MN!?%.'
  const output = cleanUpInput(input)
  expect(output).toBe('Minneapolis%2C%20MN!%3F%25.')
})
