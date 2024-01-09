const OpenAI = require('openai')

const openai = new OpenAI()

const descriptionEnhancer = async description => {
  if (!description.length) return ''

  // TODO: check if description is too long
  const prompt = `Here is a description of a personal community library, please enhance it but keep it short:\n\n"${description}"\n\nEnhanced description:\n\n`
  const gptResponse = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt,
    temperature: 0.6,
    max_tokens: 200,
  })

  // TODO: error handling
  return gptResponse.choices[0].text
}

module.exports = descriptionEnhancer
