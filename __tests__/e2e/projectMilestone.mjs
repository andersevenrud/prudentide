/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Project Milestones', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'projectMilestone.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/project/:project/milestone', () => request
    .post('/v1/project/1/milestone')
    .send({ name: 'First' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'First',
        projectId: 1,
        id: 1
      })
    }))

  test('POST /v1/project/:project/milestone', () => request
    .post('/v1/project/1/milestone')
    .send({ name: 'Second' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'Second',
        projectId: 1,
        id: 2
      })
    }))

  test('POST /v1/project/:project/milestone', () => request
    .post('/v1/project/1/milestone')
    .send({ name: 'Third' })
    .expect(201))

  test('PUT /v1/project/:project/milestone/:milestone', () => request
    .put('/v1/project/1/milestone/2')
    .send({ name: 'Secondz' })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'Secondz',
        projectId: 1,
        id: 2
      })
    }))

  test('DELETE /v1/project/:project/milestone/:milestone', () => request
    .delete('/v1/project/1/milestone/3')
    .expect(204))

  test('GET /v1/project/:project/milestone/:milestone', () => request
    .get('/v1/project/1/milestone/1')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        project: {
          id: 1
        },
        name: 'First',
        projectId: 1,
        id: 1
      })
    }))

  test('GET /v1/project/:project/milestone', () => request
    .get('/v1/project/1/milestone')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1
        },
        {
          id: 2
        }
      ])
    }))
})
