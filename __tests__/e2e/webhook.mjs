/* eslint-env jest */

import superagent from 'superagent'
import sumock from 'superagent-mock'
import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import { connectMQ, disconnectMQ, clearQueues } from '../../src/services/mq.mjs'
import { disconnectTransport } from '../../src/services/nodemailer.mjs'
import { createQueues, processQueues } from '../../src/providers/queue.mjs'
import app from '../../src/http/app.mjs'

// (match, params, headers, context) => 'OK',
const fixtureFn = jest.fn()

const superagentMock = sumock(superagent, [
  {
    pattern: 'http://webhook.example',
    fixtures: fixtureFn,
    delete: () => ({ status: 200 }),
    get: () => ({ status: 200 }),
    put: () => ({ status: 200 }),
    post: () => ({ status: 200 })
  }
])

describe('E2E - Project Webhooks', () => {
  const request = supertest(app)
  const timeout = t => new Promise(resolve => setTimeout(resolve, t))

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'projectWebhook.cjs' })
    await connectMQ(true)
    await createQueues('__e2e_webhooks')
    await clearQueues()
    await processQueues()
  })

  afterAll(async () => {
    await disconnectMQ()
    await disconnectTransport()
    await disconnectDatabase()
    superagentMock.unset()
  })

  test('POST /v1/project/:project/webhook', () => request
    .post('/v1/project/1/webhook')
    .send({
      url: 'http://localhost',
      token: 'secret'
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        url: 'http://localhost',
        token: 'secret',
        projectId: 1,
        id: 1
      })
    }))

  test('POST /v1/project/:project/webhook', () => request
    .post('/v1/project/1/webhook')
    .send({
      url: 'http://webhook.example',
      token: 'secretz',
      method: 'put',
      headers: [
        'a: b'
      ],
      events: [
        'task:close',
        'task:open',
        'task:update',
        'task:comment'
      ]
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        url: 'http://webhook.example',
        token: 'secretz',
        method: 'put',
        headers: [
          'a: b'
        ],
        events: [
          'task:close',
          'task:open',
          'task:update',
          'task:comment'
        ],
        projectId: 1,
        id: 2
      })
    }))

  test('POST /v1/project/:project/webhook', () => request
    .post('/v1/project/1/webhook')
    .send({
      url: 'http://webhook.example',
      token: 'secretz'
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        url: 'http://webhook.example',
        projectId: 1,
        id: 3
      })
    }))

  test('POST /v1/project/:project/webhook', () => request
    .post('/v1/project/1/webhook')
    .send({
      url: 'http://webhook.example',
      token: 'secretz',
      events: [
        'task:close',
        'task:open',
        'task:update',
        'task:comment'
      ]
    })
    .expect((response) => {
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        id: 4
      })
    }))

  test('DELETE /v1/project/:project/webhook', () => request
    .delete('/v1/project/1/webhook/3')
    .expect(204))

  test('DELETE /v1/project/:project/webhook - invalid webhook', () => request
    .delete('/v1/project/1/webhook/10')
    .expect(404))

  test('POST /v1/project/:project/webhook - invalid project', () => request
    .post('/v1/project/10/webhook')
    .send({
      url: 'http://nope',
      token: 'surry'
    })
    .expect(404))

  test('PUT /v1/project/:project/webhook/:webhook', () => request
    .put('/v1/project/1/webhook/1')
    .send({
      url: 'http://webhook.example',
      token: 'secretz',
      method: null
    })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        method: null,
        url: 'http://webhook.example',
        token: 'secretz',
        projectId: 1,
        id: 1
      })
    }))

  test('PUT /v1/project/:project/webhook/:webhook - invalid webhook', () => request
    .put('/v1/project/1/webhook/10')
    .send({
      url: 'http://webhook.example'
    })
    .expect(404))

  test('GET /v1/project/:project/webhook', () => request
    .get('/v1/project/1/webhook')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1,
          method: null,
          url: 'http://webhook.example',
          token: 'secretz'
        }, {
          id: 2,
          method: 'put',
          url: 'http://webhook.example',
          token: 'secretz'
        }, {
          id: 4,
          url: 'http://webhook.example',
          token: 'secretz'
        }
      ])
    }))

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({ name: 'task1', notify: [], projects: [1] })
    .expect(201))

  test('PUT /v1/task/:task', () => request
    .put('/v1/task/1')
    .send({ name: 'task1-1' })
    .expect(200))

  test('POST /v1/task/:task/comment', () => request
    .post('/v1/task/1/comment')
    .send({ body: 'Hello world' })
    .expect(201))

  test('POST /v1/task/1/close', () => request
    .post('/v1/task/1/close')
    .expect(204))

  test('PUT /v1/project/:project/webhook/:webhook - conflict', () => request
    .put('/v1/project/1/webhook/1')
    .set('x-reference-timestamp', new Date('3999-01-01T00:00:00.000Z').toISOString())
    .send({ url: 'http://fefea' })
    .expect(409))

  test('check superagent calls', async () => {
    // NOTE: This is because the queue is working in the background
    await timeout(250)

    expect(fixtureFn).toHaveBeenCalledWith(
      expect.arrayContaining(['http://webhook.example']),
      expect.objectContaining({
        event: 'task:open',
        task: expect.objectContaining({ id: 1 })
      }),
      expect.objectContaining({
        'X-Prudentide-Token': 'secretz'
      }),
      expect.objectContaining({
        method: 'post'
      })
    )
    expect(fixtureFn).toHaveBeenCalledWith(
      expect.arrayContaining(['http://webhook.example']),
      expect.objectContaining({
        event: 'task:open',
        task: expect.objectContaining({ id: 1 })
      }),
      expect.objectContaining({
        'X-Prudentide-Token': 'secretz',
        a: 'b'
      }),
      expect.objectContaining({
        method: 'put'
      })
    )
    expect(fixtureFn).toHaveBeenCalledWith(
      expect.arrayContaining(['http://webhook.example']),
      expect.objectContaining({
        event: 'task:update',
        task: expect.objectContaining({ id: 1 })
      }),
      expect.objectContaining({
        'X-Prudentide-Token': 'secretz'
      }),
      expect.objectContaining({
        method: 'post'
      })
    )
    expect(fixtureFn).toHaveBeenCalledWith(
      expect.arrayContaining(['http://webhook.example']),
      expect.objectContaining({
        event: 'task:update',
        task: expect.objectContaining({ id: 1 })
      }),
      expect.objectContaining({
        'X-Prudentide-Token': 'secretz',
        a: 'b'
      }),
      expect.objectContaining({
        method: 'put'
      })
    )
    expect(fixtureFn).toHaveBeenCalledWith(
      expect.arrayContaining(['http://webhook.example']),
      expect.objectContaining({
        event: 'task:comment',
        task: expect.objectContaining({ id: 1 }),
        comment: expect.objectContaining({ id: 1 })
      }),
      expect.objectContaining({
        'X-Prudentide-Token': 'secretz',
        a: 'b'
      }),
      expect.objectContaining({
        method: 'put'
      })
    )
  })
})
