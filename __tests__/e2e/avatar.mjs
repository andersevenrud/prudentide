/* eslint-env jest */

import supertest from 'supertest'
import jdenticon from 'jdenticon'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Avatar', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('PUT /v1/me/avatar', () => request
    .put('/v1/me/avatar')
    .attach('avatar', jdenticon.toPng('jest', 200), 'avatar.png')
    .expect(204))

  test('GET /v1/user/:user/avatar', () => request
    .get('/v1/user/1/avatar')
    .expect(200)
    .expect('Content-Type', 'image/png'))

  test('GET /v1/user/:user/avatar - no avatar', () => request
    .get('/v1/user/2/avatar')
    .expect(400))

  test('GET /v1/user/:user/avatar - invalid user', () => request
    .get('/v1/user/10/avatar')
    .expect(404))
})
