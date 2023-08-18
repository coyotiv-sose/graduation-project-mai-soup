const OpenAI = require('openai')

const openai = new OpenAI()

const descriptionEnhancer = async description => {
  // TODO: check if description is too long or empty
  const prompt = `Here is a description of a personal community library, please enhance it but keep it short:\n\n"${description}"\n\nEnhanced description:\n\n`
  const gptResponse = await openai.completions.create({
    model: 'text-davinci-003',
    prompt,
    temperature: 0.6,
    max_tokens: 200,
  })

  // TODO: error handling
  return gptResponse.choices[0].text
}

module.exports = descriptionEnhancer
