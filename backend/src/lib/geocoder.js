const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const mbxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mbxToken })

const cleanUpInput = input => {
  let dirtyInput = input
  // The search text should be expressed as a URL-encoded UTF-8 string, and
  // must not contain the semicolon character (either raw or URL-encoded).
  // Your search text, once decoded, must consist of at most 20 words
  // and numbers separated by spacing and punctuation, and at most 256 characters.

  // remove semicolons
  if (dirtyInput.includes(';')) {
    dirtyInput = dirtyInput.replace(';', '')
  }

  // trim to 256 characters
  if (dirtyInput.length > 256) {
    dirtyInput = dirtyInput.substring(0, 256)
  }

  // split by spaces and punctuation shouldnt be more than 20 words
  if (dirtyInput.split(/[^\w]/).length > 20) {
    dirtyInput = dirtyInput.split(/[^\w]/).slice(0, 20).join(' ')
  }

  // encode to utf-8
  dirtyInput = encodeURIComponent(dirtyInput)

  return dirtyInput
}

const getGeometryOfLocation = async loc => {
  // TODO: error handling for geocoding specifically?

  const location = cleanUpInput(loc)

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
