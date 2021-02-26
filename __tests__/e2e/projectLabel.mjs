/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Project Labels', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'projectLabel.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/project/:project/label', () => request
    .post('/v1/project/1/label')
    .send({ name: 'Bug' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'Bug',
        projectId: 1,
        id: 1
      })
    }))

  test('POST /v1/project/:project/label', () => request
    .post('/v1/project/1/label')
    .send({ name: 'Bug' })
    .expect(201))

  test('PUT /v1/project/:project/label/:label', () => request
    .put('/v1/project/1/label/1')
    .send({ name: 'Bugz' })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'Bugz'
      })
    }))

  test('PUT /v1/project/:project/label/:label - invalid label', () => request
    .put('/v1/project/1/label/10')
    .send({ name: 'Bugz' })
    .expect(404))

  test('PUT /v1/project/:project/label/:label - conflict', () => request
    .put('/v1/project/1/label/1')
    .set('x-reference-timestamp', new Date('3999-01-01T00:00:00.000Z').toISOString())
    .send({ name: 'Bugz' })
    .expect(409))

  test('DELETE /v1/project/:project/label/:label', () => request
    .delete('/v1/project/1/label/2')
    .expect(204))

  test('DELETE /v1/project/:project/label/:label - invalid label', () => request
    .delete('/v1/project/1/label/10')
    .expect(404))

  test('POST /v1/project/:project/label', () => request
    .post('/v1/project/1/label')
    .send({ name: 'Priority 0', priority: 0 })
    .expect(201))

  test('POST /v1/project/:project/label', () => request
    .post('/v1/project/1/label')
    .send({ name: 'Priority 1', priority: 1 })
    .expect(201))

  test('POST /v1/project/:project/label', () => request
    .post('/v1/project/1/label')
    .send({ name: 'Priority 2', priority: 2 })
    .expect(201))

  test('GET /v1/project/:project/label', () => request
    .get('/v1/project/1/label')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          name: 'Bugz'
        },
        {
          name: 'Priority 0',
          priority: 0
        },
        {
          name: 'Priority 1',
          priority: 1
        },
        {
          name: 'Priority 2',
          priority: 2
        }
      ])
    }))

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({
      name: 'task1',
      assignees: [1],
      labels: [3, 4, 5],
      projects: [1]
    })
    .expect(201))

  test('DELETE /v1/project/:project/label', () => request
    .delete('/v1/project/1/label/3')
    .expect(204))

  test('GET /v1/task/:task', () => request
    .get('/v1/task/1')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        labels: [
          {
            id: 4
          },
          {
            id: 5
          }
        ]
      })
    }))
})
