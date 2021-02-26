/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - User profile', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'profile.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/me/profile', () => request
    .put('/v1/me/profile')
    .send({ name: 'jest updated' })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'jest updated'
      })
    }))

  test('GET /v1/me/task', () => request
    .get('/v1/me/task')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1,
          name: 'task1',
          closedAt: expect.any(String)
        },
        {
          id: 2,
          name: 'task2',
          closedAt: expect.any(String)
        }
      ])
    }))
})
