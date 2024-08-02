const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const mbxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mbxToken })

const cleanUpInput = input => {
  // The search text should be expressed as a URL-encoded UTF-8 string, and
  // must not contain the semicolon character (either raw or URL-encoded).
  // Your search text, once decoded, must consist of at most 20 words
  // and numbers separated by spacing and punctuation, and at most 256 characters.

  // trim to 256 characters
  if (input.length > 256) {
    input = input.substring(0, 256)
  }

  // remove semicolons
  if (input.includes(';')) {
    input = input.replace(';', '')
  }

  // split by spaces and punctuation shouldnt be more than 20 words
  if (input.split(/[^\w]/).length > 20) {
    input = input.split(/[^\w]/).slice(0, 20).join(' ')
  }

  // encode to utf-8
  input = encodeURIComponent(input)

  return input
}

const getGeometryOfLocation = async location => {
  // TODO: error handling for geocoding specifically?

  location = cleanUpInput(location)

  const geocoderResponse = await geocoder
    .forwardGeocode({
      query: location,
      limit: 1,
    })
    .send()

  const { geometry } = geocoderResponse.body.features[0]

  return geometry
}

module.exports = {
  getGeometryOfLocation,
  cleanUpInput,
}
