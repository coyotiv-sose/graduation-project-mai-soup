const request = require('supertest')
const chance = require('chance').Chance()
const mongoose = require('mongoose')
const Comment = require('../../src/models/comment')
const app = require('../../src/app')
const getValidPassword = require('../generateValidPassword')

const agent = request.agent(app)

describe('Comments Routes', () => {
  let library

  beforeAll(async () => {
    const username = chance.word({ length: 10 })
    const password = getValidPassword()

    await agent.post('/accounts').send({
      username,
      email: chance.email(),
      password,
    })

    await agent.post('/accounts/session').send({
      username,
      password,
    })

    library = (
      await agent.post('/libraries').send({
        name: chance.word({ length: 10 }),
        location: chance.address(),
      })
    ).body
  })

  it('should create a comment', async () => {
    const content = chance.sentence()
    const comment = await agent
      .post(`/libraries/${library._id}/comments`)
      .send({
        content,
      })

    expect(comment.body).toMatchObject({
      content,
    })

    expect(comment.body.library._id).toBe(library._id)
    expect(comment.body.createdAt).toBeTruthy()

    expect(comment.status).toBe(201)
  })

  it("should get a library's comments", async () => {
    await agent.get(`/libraries/${library._id}`)

    const content = chance.sentence()
    const comment = await agent
      .post(`/libraries/${library._id}/comments`)
      .send({
        content,
      })

    const comments = await agent.get(`/libraries/${library._id}/comments`)
    expect(comments.body).toEqual(expect.arrayContaining([comment.body]))
  })

  it('should get a single comment', async () => {
    const content = chance.sentence()
    const comment = await Comment.create({
      content,
      library,
      author: library.owner,
    })

    const response = await agent.get(
      `/libraries/${library._id}/comments/${comment._id}`
    )

    const expectedComment = {
      _id: comment._id.toString(),
      content,
      library: {
        _id: library._id,
      },
      author: {
        _id: library.owner._id,
      },
    }

    expect(response.body).toMatchObject(expectedComment)
    expect(response.status).toBe(200)
  })

  it('should return 404 if comment does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.get(
      `/libraries/${library._id}/comments/${fakeId}`
    )

    expect(response.status).toBe(404)
  })

  it('should return 404 if library does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.get(
      `/libraries/${fakeId}/comments/${new mongoose.Types.ObjectId()}`
    )

    expect(response.status).toBe(404)
  })

  it('should delete a comment', async () => {
    const content = chance.sentence()
    const comment = await Comment.create({
      content,
      library,
      author: library.owner,
    })

    const response = await agent.delete(
      `/libraries/${library._id}/comments/${comment._id}`
    )

    expect(response.status).toBe(204)
    expect(await Comment.countDocuments({ _id: comment._id })).toBe(0)
  })

  it('should return 404 if trying to delete a comment that does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.delete(
      `/libraries/${library._id}/comments/${fakeId}`
    )

    expect(response.status).toBe(404)
  })
})
