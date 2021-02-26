/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import { connectMQ, disconnectMQ } from '../../src/services/mq.mjs'
import { disconnectTransport } from '../../src/services/nodemailer.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Misc', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectMQ()
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
  })

  afterAll(async () => {
    await disconnectMQ()
    await disconnectTransport()
    await disconnectDatabase()
  })

  describe('/v1/health', () => {
    test('GET /v1/health', () => request
      .get('/v1/health')
      .expect(200))
  })

  describe('/v1/notfound', () => {
    test('GET /v1/notfound', () => request
      .get('/v1/notfound')
      .expect(404))
  })
})
