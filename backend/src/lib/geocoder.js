const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const mbxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mbxToken })

module.exports.getGeometryOfLocation = async location => {
  // TODO: error handling for geocoding specifically?
  const geocoderResponse = await geocoder
    .forwardGeocode({
      query: location,
      limit: 1,
    })
    .send()

  const { geometry } = geocoderResponse.body.features[0]

  return geometry
}
