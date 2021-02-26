/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Watching', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'taskWatch.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/task/:task/watch', () => request
    .post('/v1/task/1/watch?__sub=jest2')
    .expect(204))

  test('POST /v1/task/:task/watch - invalid task', () => request
    .post('/v1/task/10/watch')
    .expect(404))

  test('DELETE /v1/task/:task/watch', () => request
    .delete('/v1/task/1/watch?__sub=jest2')
    .expect(204))

  test('DELETE /v1/task/:task/watch - invalid task', () => request
    .delete('/v1/task/10/watch')
    .expect(404))

  test('POST /v1/task/:task/watch', () => request
    .post('/v1/task/1/watch?__sub=jest2')
    .expect(204))

  test('POST /v1/task/:task/watch', () => request
    .post('/v1/task/1/watch')
    .expect(204))

  test('GET /v1/task/:task/watch', () => request
    .get('/v1/task/1/watch')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 2
        },
        {
          id: 1
        }
      ])
    }))

  test('GET /v1/task/:task/watch - invalid task', () => request
    .get('/v1/task/10/watch')
    .expect(404))
})
