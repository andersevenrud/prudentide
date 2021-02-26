/* eslint-env jest */

import supertest from 'supertest'
import firebase from 'firebase-admin'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import { connectMQ, disconnectMQ, clearQueues } from '../../src/services/mq.mjs'
import { disconnectTransport } from '../../src/services/nodemailer.mjs'
import { createQueues, processQueues } from '../../src/providers/queue.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Notifications', () => {
  const request = supertest(app)
  const timeout = t => new Promise(resolve => setTimeout(resolve, t))

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'notification.cjs' })
    await connectMQ(true)
    await createQueues('__e2e_notifications')
    await clearQueues()
    await processQueues()
  })

  afterAll(async () => {
    await disconnectMQ()
    await disconnectTransport()
    await disconnectDatabase()
  })

  test('POST /v1/task', () => request
    .post('/v1/task')
    .send({
      name: 'task1',
      assignees: [1],
      notify: ['sms', 'push', 'email'],
      projects: [1]
    })
    .expect(201))

  test('POST /v1/task', () => request
    .post('/v1/task?__sub=jest2')
    .send({
      name: 'task2',
      assignees: [1],
      notify: ['sms', 'push', 'email'],
      projects: [1]
    })
    .expect(201))

  test('POST /v1/task/:task/watch', () => request
    .post('/v1/task/1/watch?__sub=jestadmin')
    .expect(204))

  test('POST /v1/task/:task/watch', () => request
    .post('/v1/task/2/watch?__sub=jestadmin')
    .expect(204))

  test('POST /v1/task/:task/comment', () => request
    .post('/v1/task/1/comment')
    .send({ body: 'Hello world' })
    .expect(201))

  test('POST /v1/task/:task/comment', () => request
    .post('/v1/task/1/comment?__sub=jest2')
    .send({ body: 'Hello world' })
    .expect(201))

  test('POST /v1/task/:task/close', () => request
    .post('/v1/task/1/close')
    .expect(204))

  test('POST /v1/task/:task/action', () => request
    .post('/v1/task/1/action')
    .send({
      scheduledAt: new Date('1999-01-01 00:00:00'),
      action: 'remind',
      attributes: {
        remind: 'creator'
      }
    })
    .expect(201))

  test('POST /v1/task/:task/action', () => request
    .post('/v1/task/1/action')
    .send({
      scheduledAt: new Date('1999-01-01 00:00:00'),
      action: 'remind',
      attributes: {
        remind: 'assignees'
      }
    })
    .expect(201))

  test('POST /v1/task/:task/action', () => request
    .post('/v1/task/2/action')
    .send({
      scheduledAt: new Date('1999-01-01 00:00:00'),
      action: 'remind',
      attributes: {
        remind: 'watchers'
      }
    })
    .expect(201))

  test('POST /v1/task/:task/action', () => request
    .post('/v1/task/2/action')
    .send({
      scheduledAt: new Date('1999-01-01 00:00:00'),
      action: 'remind',
      attributes: {
        remind: 'everybody'
      }
    })
    .expect(201))

  test('notifications should have been sent', async () => {
    // NOTE: This is because the queue is working in the background
    await timeout(350)

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest2device'], {
        notification: {
          body: null,
          title: '[project1 - task1] Task created'
        },
        data: { userId: 2 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest3device'], {
        notification: {
          body: null,
          title: '[project1 - task1] Task created'
        },
        data: { userId: 3 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['device1'], {
        notification: {
          body: null,
          title: '[project1 - task2] Assigned task'
        },
        data: { userId: 1 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['device1'], {
        notification: {
          body: null,
          title: '[project1 - task2] Task created'
        },
        data: { userId: 1 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest3device'], {
        notification: {
          body: null,
          title: '[project1 - task2] Task created'
        },
        data: { userId: 3 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest3device'], {
        notification: {
          body: 'Hello world',
          title: '[project1 - task1] jest commented'
        },
        data: { userId: 3 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['device1'], {
        notification: {
          body: 'Hello world',
          title: '[project1 - task1] jest2 commented'
        },
        data: { userId: 1 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest3device'], {
        notification: {
          body: 'Hello world',
          title: '[project1 - task1] jest2 commented'
        },
        data: { userId: 3 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest3device'], {
        notification: {
          body: null,
          title: '[project1 - task1] Completed task'
        },
        data: { userId: 3 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest2device'], {
        notification: {
          body: null,
          title: '[project1 - task1] Completed task'
        },
        data: { userId: 2 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['device1'], {
        notification: {
          body: null,
          title: '[project1 - task1] Task reminder'
        },
        data: { userId: 1 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['device1'], {
        notification: {
          body: null,
          title: '[project1 - task1] Task reminder'
        },
        data: { userId: 1 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest2device'], {
        notification: {
          body: null,
          title: '[project1 - task2] Task reminder'
        },
        data: { userId: 2 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest3device'], {
        notification: {
          body: null,
          title: '[project1 - task2] Task reminder'
        },
        data: { userId: 3 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['device1'], {
        notification: {
          body: null,
          title: '[project1 - task2] Task reminder'
        },
        data: { userId: 1 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest2device'], {
        notification: {
          body: null,
          title: '[project1 - task2] Task reminder'
        },
        data: { userId: 2 }
      }
    )

    expect(firebase.__sendToDevice).toHaveBeenCalledWith(
      ['jest3device'], {
        notification: {
          body: null,
          title: '[project1 - task2] Task reminder'
        },
        data: { userId: 3 }
      }
    )
  })
})
