/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

const buffer = () => Buffer.from(new Date().toString(), 'utf8')

describe('E2E - Task Attachments', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'taskAttachment.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('POST /v1/task/:task/attachment', async () => {
    const response = await request
      .post('/v1/task/1/attachment')
      .attach('attachment', buffer(), 'attachment.txt')

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      filename: 'attachment.txt',
      taskId: 1,
      userId: 1,
      id: 1
    })
  })

  test('POST /v1/task/:task/attachment', () => request
    .post('/v1/task/1/attachment')
    .attach('attachment', buffer(), 'attachment.txt')
    .expect(201))

  test('POST /v1/task/:task/attachment - as another user', () => request
    .post('/v1/task/1/attachment?__sub=jest2')
    .attach('attachment', buffer(), 'attachment.txt')
    .expect(201))

  test('POST /v1/task/:task/attachment - invalid attachment', () => request
    .post('/v1/task/1/attachment')
    .attach('invalid', buffer(), 'attachment.txt')
    .expect(422))

  test('POST /v1/task/:task/attachment - no attachment', () => request
    .post('/v1/task/1/attachment')
    .expect(422))

  test('POST /v1/task/:task/attachment - invalid task', () => request
    .post('/v1/task/10/attachment')
    .attach('attachment', Buffer.from('', 'utf8'), 'invalid.txt')
    .expect(404))

  test('GET /v1/task/:task/attachment/:attachment', () => request
    .get('/v1/task/1/attachment/1')
    .expect(200))

  test('GET /v1/task/:task/attachment/:attachment - download', () => request
    .get('/v1/task/1/attachment/1')
    .query({ download: true })
    .expect(200))

  test('GET /v1/task/:task/attachment/:attachment - invalid attachment', () => request
    .get('/v1/task/1/attachment/10')
    .expect(404))

  test('DELETE /v1/task/:task/attachment/:attachment', () => request
    .delete('/v1/task/1/attachment/2')
    .expect(204))

  test('DELETE /v1/task/:task/attachment/:attachment - invalid attachment', () => request
    .delete('/v1/task/1/attachment/10')
    .expect(404))

  test('DELETE /v1/task/:task/attachment/:attachment - not owner', () => request
    .delete('/v1/task/1/attachment/3')
    .expect(403))

  test('DELETE /v1/task/:task/attachment/:attachment - as admin', () => request
    .delete('/v1/task/1/attachment/3?__sub=jestadmin')
    .expect(204))

  test('GET /v1/task/:task', () => request
    .get('/v1/task/1')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        projects: [
          {
            id: 1
          }
        ],
        name: 'attachment task',
        userId: 1,
        id: 1
      })
    }))

  test('GET /v1/task/:task/attachment', () => request
    .get('/v1/task/1/attachment')
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([
        {
          id: 1,
          filename: 'attachment.txt'
        }
      ])
    }))
})
