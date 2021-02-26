/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Permissions', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'permission.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('group access', () => {
    test('POST /v1/project/:project - without groups', () => request
      .post('/v1/project')
      .send({ name: 'foo' })
      .expect((response) => {
        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
          groups: []
        })
      }))

    test('POST /v1/project/:project - with groups', () => request
      .post('/v1/project')
      .send({ name: 'bar', groups: [2] })
      .expect((response) => {
        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
          groups: [
            {
              id: 2
            }
          ]
        })
      }))

    test('PUT /v1/project/:project - update with unaccessible groups', () => request
      .put('/v1/project/2')
      .send({ groups: [1] })
      .expect((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
          groups: [
            {
              id: 2
            }
          ]
        })
      }))

    test('PUT /v1/project/:project - update groups', () => request
      .put('/v1/project/1?__sub=jestadmin')
      .send({ groups: [1] })
      .expect((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
          groups: [
            {
              id: 1
            }
          ]
        })
      }))

    test('GET /v1/project/:project - group permission accepted', () => request
      .get('/v1/project/2')
      .expect(200))

    test('GET /v1/project/:project - group permission denied', () => request
      .get('/v1/project/1')
      .expect(401))

    test('POST /v1/task - with groups', () => request
      .post('/v1/task')
      .send({ name: 'task', projects: [1] })
      .expect(201))

    test('GET /v1/task/:task - group permission denied', () => request
      .get('/v1/task/1')
      .expect(401))
  })

  describe('permissions', () => {
    test('POST /v1/project', () => request
      .post('/v1/project?__sub=jest2')
      .send({
        name: 'project-group-test',
        body: 'body here',
        groups: [2]
      })
      .expect(201))

    test('PUT /v1/project/:project', () => request
      .put('/v1/project/3?__sub=jest2')
      .send({
        groups: [1, 2, 3]
      })
      .expect(200))

    test('GET /v1/project/:project', () => request
      .get('/v1/project/3')
      .expect((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
          groups: [
            {
              id: 2
            }
          ]
        })
      }))

    test('PUT /v1/project/:project -- as admin', () => request
      .put('/v1/project/3?__sub=jestadmin')
      .send({
        groups: [1, 2, 3]
      })
      .expect(200))

    test('GET /v1/project/:project', () => request
      .get('/v1/project/3')
      .expect((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
          groups: [
            {
              id: 1
            },
            {
              id: 2
            },
            {
              id: 3
            }
          ]
        })
      }))

    test('POST /v1/project/:project/webhook', () => request
      .post('/v1/project/3/webhook')
      .send({
        url: 'http://localhost',
        token: 'hush'
      })
      .expect(201))

    test('PUT /v1/project/:project/webhook/:webhook', () => request
      .put('/v1/project/3/webhook/1?__sub=jest2')
      .expect(403))
  })
})
