/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Task Comments', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'taskComment.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/task/:task/comment', () => request
    .post('/v1/task/1/comment')
    .send({ body: 'Hello world' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        body: 'Hello world',
        taskId: 1,
        userId: 1,
        id: 1
      })
    }))

  test('POST /v1/task/:task/comment - another user', () => request
    .post('/v1/task/1/comment?__sub=jest2')
    .send({ body: 'Hey yall' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        body: 'Hey yall',
        taskId: 1,
        userId: 2,
        id: 2
      })
    }))

  test('POST /v1/task/:task/comment - invalid task', () => request
    .post('/v1/task/10/comment')
    .send({
      body: 'Opsie'
    })
    .expect(404))

  test('PUT /v1/task/:task/comment/:comment', () => request
    .put('/v1/task/1/comment/1')
    .send({
      body: 'Hello world!'
    })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        body: 'Hello world!',
        taskId: 1,
        userId: 1,
        id: 1
      })
    }))

  test('PUT /v1/task/:task/comment/:comment - invalid comment', () => request
    .put('/v1/task/1/comment/10')
    .send({ body: 'Ops' })
    .expect(404))

  test('PUT /v1/task/:task/comment/:comment - forbidden comment', () => request
    .put('/v1/task/1/comment/2')
    .send({ body: 'Forbidden' })
    .expect(403))

  test('GET /v1/task/:task/comment', () => request
    .get('/v1/task/1/comment')
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

  test('GET /v1/task/:task/comment - invalid task', () => request
    .get('/v1/task/10/comment')
    .expect(404))

  test('PUT /v1/task/:task/comment/:comment - conflict', () => request
    .put('/v1/task/1/comment/1')
    .set('x-reference-timestamp', new Date('3999-01-01T00:00:00.000Z').toISOString())
    .send({ body: 'Should conflict' })
    .expect(409))

  test('POST /v1/task/:task/comment/:comment/stick', () => request
    .post('/v1/task/1/comment/1/stick')
    .expect(204))

  test('DELETE /v1/task/:task/comment/:comment/stick', () => request
    .delete('/v1/task/1/comment/1/stick')
    .expect(204))

  test('POST /v1/task/:task/comment - sticky', () => request
    .post('/v1/task/1/comment')
    .send({ body: 'Hello world', sticky: true })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        body: 'Hello world',
        sticky: 1,
        id: 3
      })
    }))

  test('GET /v1/task/:task/comment', () => request
    .get('/v1/task/1/comment')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1,
          sticky: 0
        },
        {
          id: 2
        },
        {
          id: 3,
          sticky: 1
        }
      ])
    }))
})
