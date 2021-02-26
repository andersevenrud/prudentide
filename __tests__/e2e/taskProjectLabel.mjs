/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Task Project Labels', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'taskProjectLabel.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({
      name: 'task1',
      assignees: [1],
      labels: [1, 3],
      projects: [1]
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'task1',
        labels: [
          {
            id: 1
          },
          {
            id: 3
          }
        ]
      })
    }))

  test('PUT /v1/task/:task', () => request
    .put('/v1/task/1')
    .send({
      labels: [1, 2]
    })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        labels: [
          {
            id: 1
          },
          {
            id: 2
          }
        ]
      })
    }))
})
