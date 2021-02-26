/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Groups', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'group.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/group', () => request
    .post('/v1/group')
    .send({ name: 'Copyleft Solutions' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'Copyleft Solutions',
        id: 1
      })
    }))

  test('POST /v1/group', () => request
    .post('/v1/group')
    .send({ name: 'All' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'All',
        id: 2
      })
    }))

  test('PUT /v1/group/:group', () => request
    .put('/v1/group/2')
    .send({ name: 'Everybody' })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'Everybody',
        id: 2
      })
    }))

  test('PUT /v1/group/:group - invalid group', () => request
    .put('/v1/group/10')
    .send({ name: 'Opsie' })
    .expect(404))

  test('GET /v1/group', () => request
    .get('/v1/group')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          name: 'Copyleft Solutions',
          id: 1
        },
        {
          name: 'Everybody',
          id: 2
        }
      ])
    }))

  test('POST /v1/group - sub group', () => request
    .post('/v1/group')
    .send({ name: 'All Sub group', parentId: 2 })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'All Sub group',
        parentId: 2,
        id: 3
      })
    }))

  test('POST /v1/group - invalid sub group', () => request
    .post('/v1/group')
    .send({ name: 'All Sub group', parentId: 10 })
    .expect(400))

  test('POST /v1/group - max nest level error', () => request
    .post('/v1/group')
    .send({ name: 'All Sub group', parentId: 3 })
    .expect(400))

  test('GET /v1/group - should not have sub group', () => request
    .get('/v1/group')
    .expect((response) => {
      expect(response.status).toBe(200)

      const ids = response.body.map(g => g.id)
      expect(ids).toEqual(expect.not.arrayContaining([3]))
    }))

  test('GET /v1/group - query should get sub groups', () => request
    .get('/v1/group?parentId=2')
    .expect((response) => {
      expect(response.status).toBe(200)

      const ids = response.body.map(g => g.id)
      expect(ids).toEqual(expect.arrayContaining([3]))
    }))

  test('GET /v1/group/:group - invalid group', () => request
    .get('/v1/group/10')
    .expect(404))

  test('POST /v1/project', () => request
    .post('/v1/project?__sub=jestadmin')
    .send({ name: 'project1', groups: [2] })
    .expect((response) => {
      expect(response.status).toBe(201)
    }))

  test('POST /v1/project', () => request
    .post('/v1/project?__sub=jestadmin')
    .send({ name: 'project1', groups: [1] })
    .expect((response) => {
      expect(response.status).toBe(201)
    }))

  test('POST /v1/project', () => request
    .post('/v1/project?__sub=jestadmin')
    .send({ name: 'project1', groups: [2] })
    .expect((response) => {
      expect(response.status).toBe(201)
    }))

  test('GET /v1/group/:group', () => request
    .get('/v1/group/3')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: 3,
        parent: {
          id: 2
        }
      })
    }))

  test('PUT /v1/group/:group - conflict', () => request
    .put('/v1/group/1')
    .set('x-reference-timestamp', new Date('3999-01-01T00:00:00.000Z').toISOString())
    .send({ name: 'Should conflict' })
    .expect(409))
})
