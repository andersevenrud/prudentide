/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'
import config from '../../src/config.mjs'

describe('E2E - Projects', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'project.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/project', () => request
    .post('/v1/project')
    .send({ name: 'project1' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'project1',
        userId: 1,
        id: 1
      })
    }))

  test('GET /v1/project/label', () => request
    .get('/v1/project/1/label')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(
        response.body.map(g => g.name).sort()
      ).toMatchObject(
        config.app.labels.defaults.map(g => g.name).sort()
      )
    }))

  test('POST /v1/project', () => request
    .post('/v1/project')
    .send({ name: 'project2', body: 'body here' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'project2',
        body: 'body here',
        id: 2
      })
    }))

  test('POST /v1/project', () => request
    .post('/v1/project')
    .send({ name: 'project3', body: 'this is for testing archiving' })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'project3',
        body: 'this is for testing archiving',
        id: 3
      })
    }))

  test('POST /v1/project - invalid body', () => request
    .post('/v1/project')
    .send({})
    .expect((response) => {
      expect(response.status).toBe(422)
      expect(response.body).toMatchObject({
        validation: [
          {
            message: 'should have required property \'name\''
          }
        ]
      })
    }))

  test('PUT /v1/project/:project', () => request
    .put('/v1/project/1')
    .send({ name: 'project1-1', body: 'body here' })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'project1-1',
        body: 'body here',
        id: 1
      })
    }))

  test('PUT /v1/project/:project - invalid project', () => request
    .put('/v1/project/10')
    .send({ name: 'invalid project' })
    .expect(404))

  test('PUT /v1/project/:project - invalid param', () => request
    .put('/v1/project/NaN')
    .expect(422))

  // FIXME: This should be a standalone test after JWT mocks is fixed
  test('PUT /v1/project/:project - invalid user', () => request
    .put('/v1/project/555?__sub=invalid')
    .expect(401))

  test('GET /v1/project', () => request
    .get('/v1/project')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1,
          name: 'project1-1'
        },
        {
          id: 2,
          name: 'project2'
        },
        {
          id: 3,
          name: 'project3'
        }
      ])
    }))

  test('DELETE /v1/project/:project/archive', () => request
    .delete('/v1/project/3/archive')
    .expect(204))

  test('POST /v1/project/:project/archive', () => request
    .post('/v1/project/3/archive')
    .expect(204))

  test('POST /v1/project/:project/archive - invalid project', () => request
    .post('/v1/project/10/archive')
    .expect(404))

  test('GET /v1/project - after archival', () => request
    .get('/v1/project')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1,
          name: 'project1-1'
        },
        {
          id: 2,
          name: 'project2'
        }
      ])
    }))

  test('GET /v1/project/:project - not found', () => request
    .get('/v1/project/10')
    .expect(404))

  test('PUT /v1/project/:project - conflict', () => request
    .put('/v1/project/1')
    .set('x-reference-timestamp', new Date('3999-01-01T00:00:00.000Z').toISOString())
    .send({ body: 'Should conflict' })
    .expect(409))

  test('POST /v1/project - as another user', () => request
    .post('/v1/project?__sub=jest2')
    .send({ name: 'something', groups: [1] })
    .expect(201))

  test('POST /v1/project - as admin', () => request
    .post('/v1/project?__sub=jestadmin')
    .send({ name: 'something', groups: [1, 2] })
    .expect(201))

  test('GET /v1/project - filter users (1)', () => request
    .get('/v1/project?users=1')
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

  test('GET /v1/project - filter users (2)', () => request
    .get('/v1/project?users=1,2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1
        },
        {
          id: 2
        },
        {
          id: 4
        }
      ])
    }))

  test('GET /v1/project - filter groups (1)', () => request
    .get('/v1/project?groups=2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 5
        }
      ])
    }))

  test('GET /v1/project - filter groups (2)', () => request
    .get('/v1/project?groups=1,2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 4
        },
        {
          id: 5
        }
      ])
    }))

  test('GET /v1/project - filter groups (3)', () => request
    .get('/v1/project?groups=10')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([])
    }))

  test('GET /v1/project - filter - invalid format', () => request
    .get('/v1/project?groups=fea')
    .expect(422))
})
