/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Task Project Milestones', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'taskProjectMilestone.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({
      name: 'task1',
      assignees: [1],
      milestones: [1],
      projects: [1]
    })
    .expect(201))

  test('PUT /v1/task/:task', () => request
    .put('/v1/task/1')
    .send({
      milestones: [1, 2]
    })
    .expect(200))

  test('GET /v1/task/:task', () => request
    .get('/v1/task/1')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        milestones: [
          {
            id: 1
          },
          {
            id: 2
          }
        ]
      })
    }))

  test('DELETE /v1/project/:project/milestone/:milestone', () => request
    .delete('/v1/project/1/milestone/1')
    .expect(204))

  test('GET /v1/task/:task', () => request
    .get('/v1/task/1')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        milestones: [
          {
            id: 2
          }
        ]
      })
    }))
})
