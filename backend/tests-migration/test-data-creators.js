const User = require('../src/models/user')
const Library = require('../src/models/library')
const chance = require('chance').Chance()

const createTestUser = async ({
  username,
  memberships = [],
  ownedLibraries = [],
  loans = [],
}) => {
  const user = new User({
    username,
    memberships,
    ownedLibraries,
    loans,
    email: chance.email(),
  })

  await user.save()
  return user
}

const createTestLibrary = async ({ name, owner, books = [], members = [] }) => {
  const library = await owner.createLibrary({
    name,
    location: chance.address(),
  })

  return library
}

module.exports = {
  createTestUser,
  createTestLibrary,
}
