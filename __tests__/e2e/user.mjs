/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - User', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('GET /v1/user/:id', () => request
    .get('/v1/user/1')
    .expect(200))

  test('GET /v1/user/:id - invalid user', () => request
    .get('/v1/user/10')
    .expect(404))
})
