/* eslint-env jest */

import MockDate from 'mockdate'
import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import { connectMQ, disconnectMQ, clearQueues } from '../../src/services/mq.mjs'
import { createQueues, processQueues } from '../../src/providers/queue.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Task Actions', () => {
  const request = supertest(app)
  const timeout = t => new Promise(resolve => setTimeout(resolve, t))

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'taskAction.cjs' })
    await connectMQ(true)
    await createQueues('__e2e_actions')
    await clearQueues()
    await processQueues()
  })

  afterAll(async () => {
    await disconnectMQ()
    await disconnectDatabase()
  })

  describe('CRUD', () => {
    test('POST /v1/task/:task/action', () => request
      .post('/v1/task/1/action')
      .send({
        scheduledAt: new Date('2999-01-01 00:00:00'),
        action: 'assign',
        attributes: {
          to: 2
        }
      })
      .expect((response) => {
        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
          action: 'assign',
          attributes: {
            to: 2
          },
          taskId: 1,
          userId: 1,
          id: 1
        })
      }))

    test('PUT /v1/task/:task/action/:action', () => request
      .put('/v1/task/1/action/1')
      .send({
        scheduledAt: new Date('3000-01-01 00:00:00')
      })
      .expect(200))

    test('POST /v1/task/:task/action', () => request
      .post('/v1/task/1/action')
      .send({
        scheduledAt: new Date('3000-01-01 00:00:00'),
        action: 'assign',
        attributes: {
          to: 3
        }
      })
      .expect(201))

    test('POST /v1/task/:task/action', () => request
      .post('/v1/task/1/action')
      .send({
        scheduledAt: new Date('3000-01-01 00:00:00'),
        action: 'close'
      })
      .expect(201))

    test('DELETE /v1/task/:task/action/:action', () => request
      .delete('/v1/task/1/action/1')
      .expect(204))

    test('POST /v1/task/:task/action - invalid schema', () => request
      .post('/v1/task/1/action')
      .send({
        scheduledAt: new Date('3000-01-01 00:00:00'),
        action: 'assign',
        attributes: {
          foo: 'invalid'
        }
      })
      .expect(422))

    test('GET /v1/task/:task/action', () => request
      .get('/v1/task/1/action')
      .expect((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject([
          {
            id: 2
          },
          {
            id: 3
          }
        ])
      }))
  })

  describe('Future actions', () => {
    afterAll(() => {
      MockDate.reset()
    })

    test('should forward time', () => {
      MockDate.set('3000-01-02 00:00:00')
      expect(new Date().toISOString()).toBe('3000-01-02T00:00:00.000Z')
    })

    test('GET /v1/task/:task', async () => {
      // NOTE: This is because the queue is working in the background
      await timeout(250)

      return request
        .get('/v1/task/1')
        .expect((response) => {
          expect(response.status).toBe(200)
          expect(response.body).toMatchObject({
            closedAt: expect.any(String),
            assignees: [
              {
                id: 3
              }
            ]
          })
        })
    })
  })
})
