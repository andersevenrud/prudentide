/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - User Devices', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/me/device', () => request
    .post('/v1/me/device')
    .send({ deviceToken: 'device1' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        deviceToken: 'device1',
        userId: 1,
        id: 1
      })
    }))

  test('POST /v1/me/device', () => request
    .post('/v1/me/device')
    .send({ deviceToken: 'device2' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        deviceToken: 'device2',
        userId: 1,
        id: 2
      })
    }))

  test('POST /v1/me/device', () => request
    .post('/v1/me/device?__sub=jest2')
    .send({ deviceToken: 'jest2device' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        deviceToken: 'jest2device',
        userId: 2,
        id: 3
      })
    }))

  test('DELETE /v1/me/device/:device', () => request
    .delete('/v1/me/device/2')
    .expect(204))

  test('DELETE /v1/me/device/:device - invalid device', () => request
    .delete('/v1/me/device/10')
    .expect(400))

  test('GET /v1/me/profile', () => request
    .get('/v1/me/profile')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'jest',
        email: 'jest@localhost',
        groups: [],
        devices: [
          {
            deviceToken: 'device1'
          }
        ]
      })
    }))
})
