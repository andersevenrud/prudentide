/* eslint-env jest */

import supertest from 'supertest'
import { connectDatabase, disconnectDatabase, knex } from '../../src/services/database.mjs'
import app from '../../src/http/app.mjs'

describe('E2E - Search', () => {
  const request = supertest(app)

  beforeAll(async () => {
    await connectDatabase(false)
    await knex.migrate.latest()
    await knex.seed.run({ specific: 'init.cjs' })
    await knex.seed.run({ specific: 'search.cjs' })
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  test('GET /v1/search', () => request
    .get('/v1/search')
    .query({ query: 'foo' })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        totalTasks: 2,
        totalProjects: 2,
        projects: [
          {
            name: 'project1 foo'
          },
          {
            name: 'project2 foo'
          }
        ],
        tasks: [
          {
            name: 'task1 foo'
          },
          {
            name: 'task2 foo'
          }
        ]
      })
    }))

  test('GET /v1/search - invalid pagination', () => request
    .get('/v1/search')
    .query({ query: '2', page: 'erea' })
    .expect(422))

  test('GET /v1/search - pagination 1/2', () => request
    .get('/v1/search')
    .query({ query: 'project', page: 0, limit: 1 })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        totalTasks: 0,
        totalProjects: 2,
        projects: [
          {
            name: 'project1 foo'
          }
        ]
      })
    }))

  test('GET /v1/search - pagination 2/2', () => request
    .get('/v1/search')
    .query({ query: 'project', page: 1, limit: 1 })
    .expect((response) => {
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        totalTasks: 0,
        totalProjects: 2,
        projects: [
          {
            name: 'project2 foo'
          }
        ]
      })
    }))
})
