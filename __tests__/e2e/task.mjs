/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Tasks', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'task.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({
      name: 'task1',
      data: {
        some: 'data'
      },
      attributes: {
        foo: 'bar'
      },
      assignees: [1],
      notify: [],
      milestones: [1, 2],
      projects: [1]
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        closedAt: null,
        notify: [],
        data: {
          some: 'data'
        },
        attributes: {
          foo: 'bar'
        },
        milestones: [
          {
            id: 1
          },
          {
            id: 2
          }
        ],
        assignees: [
          {
            id: 1
          }
        ],
        name: 'task1',
        userId: 1,
        id: 1
      })
    }))

  test('GET /v1/task/:task/watch', () => request
    .get('/v1/task/1/watch')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1
        }
      ])
    }))

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({
      name: 'task2',
      assignees: [1],
      notify: [],
      milestones: [3],
      labels: [2],
      projects: [1]
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'task2',
        notify: [],
        assignees: [
          {
            id: 1
          }
        ],
        milestones: [
          {
            id: 3
          }
        ]
      })
    }))

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({
      name: 'task3',
      projects: [1]
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'task3',
        assignees: []
      })
    }))

  test('POST /v1/task', () => request
    .post('/v1/task?__sub=jest2')
    .send({
      name: 'task4',
      body: 'task 4 body',
      data: {},
      attributes: {},
      assignees: [1],
      notify: [],
      projects: [2]
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        name: 'task4',
        notify: [],
        assignees: [
          {
            id: 1
          }
        ]
      })
    }))

  test('POST /v1/task - invalid project', () => request
    .post('/v1/task')
    .send({
      name: 'opsie',
      projects: [10]
    })
    .expect(400))

  test('PUT /v1/task/:task', () => request
    .put('/v1/task/1')
    .send({
      name: 'task1-1',
      data: {
        some: 'new data'
      },
      assignees: [2]
    })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'task1-1',
        data: {
          some: 'new data'
        },
        attributes: {
          foo: 'bar'
        },
        assignees: [
          {
            id: 2
          }
        ]
      })
    }))

  test('POST /v1/task/:task/close', () => request
    .post('/v1/task/1/close')
    .expect(204))

  test('POST /v1/task/:task/close', () => request
    .post('/v1/task/2/close')
    .expect(204))

  test('GET /v1/task/:task - should be closed', () => request
    .get('/v1/task/2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        closedAt: expect.any(String)
      })
    }))

  test('POST /v1/task/:task/open', () => request
    .post('/v1/task/2/open')
    .expect(204))

  test('GET /v1/task/:task - should be open', () => request
    .get('/v1/task/2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        closedAt: null
      })
    }))

  test('POST /v1/task/:task/close', () => request
    .post('/v1/task/2/close')
    .expect(204))

  test('PUT /v1/task/:task - empty dataset', () => request
    .put('/v1/task/2')
    .send({ })
    .expect(200))

  test('PUT /v1/task/:task - invalid task', () => request
    .put('/v1/task/10')
    .send({
      name: 'ops'
    })
    .expect(404))

  test('GET /v1/task/:task', () => request
    .get('/v1/task/1')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        name: 'task1-1',
        closedAt: expect.any(String),
        projects: [
          {
            id: 1
          }
        ],
        userId: 1,
        id: 1
      })
    }))

  test('GET /v1/project/:project/task', () => request
    .get('/v1/project/1/task')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        expect.objectContaining({
          name: 'task1-1',
          closedAt: expect.any(String)
        }),
        expect.objectContaining({
          name: 'task2',
          closedAt: expect.any(String)
        }),
        expect.objectContaining({
          name: 'task3',
          closedAt: null
        })
      ])
    }))

  test('GET /v1/task/:task - not found', () => request
    .get('/v1/task/10')
    .expect(404))

  test('PUT /v1/task/:task - conflict', () => request
    .put('/v1/task/1')
    .set('x-reference-timestamp', new Date('3999-01-01T00:00:00.000Z').toISOString())
    .send({ body: 'Should conflict' })
    .expect(409))

  test('POST /v1/task - invalid assigned user', () => request
    .post('/v1/task')
    .send({
      name: 'invalid assigned user',
      assignees: [100],
      projects: [2]
    })
    .expect(400))

  test('PUT /v1/task/:task - invalid assigned user', () => request
    .put('/v1/task/1')
    .send({
      assignees: [100]
    })
    .expect(400))

  test('GET /v1/project/:project/task - filter users (1)', () => request
    .get('/v1/project/2/task?users=2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 4
        }
      ])
    }))

  test('GET /v1/project/:project/task - filter users (2)', () => request
    .get('/v1/project/1/task?users=1')
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
          id: 3
        }
      ])
    }))

  test('GET /v1/project/:project/task - filter assigned users', () => request
    .get('/v1/project/1/task?assignedUsers=2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1
        }
      ])
    }))

  test('GET /v1/project/:project/task - filter milestones', () => request
    .get('/v1/project/1/task?milestones=1,3')
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

  test('GET /v1/project/:project/task - filter labels', () => request
    .get('/v1/project/1/task?labels=2')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 2
        }
      ])
    }))

  test('GET /v1/project/:project/task - filter status (open)', () => request
    .get('/v1/project/1/task?status=open')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 3
        }
      ])
    }))

  test('GET /v1/project/:project/task - filter status (closed)', () => request
    .get('/v1/project/1/task?status=closed')
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

  test('GET /v1/project/:project/task - filter status (all)', () => request
    .get('/v1/project/1/task?status=all')
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
          id: 3
        }
      ])
    }))

  test('GET /v1/project/:project/task - filter status (invalid)', () => request
    .get('/v1/project/1/task?status=invalid')
    .expect(422))
})
