const descriptionEnhancer = require('../../src/lib/description-enhancer')

it('enhances a description', async () => {
  const description = 'A personal community library.'
  const enhancedDescription = await descriptionEnhancer(description)
  expect(enhancedDescription).toBeDefined()
  expect(enhancedDescription.length).toBeGreaterThan(description.length)
})

it('handles an empty description', async () => {
  const description = ''
  const enhancedDescription = await descriptionEnhancer(description)
  expect(enhancedDescription).toBeDefined()
  expect(enhancedDescription.length).toBe(0)
})
