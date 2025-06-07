import 'dotenv/config';
import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { setupContainer } from './container.mjs'

let container, app, id_testuser

const username = 'testuser'

const exercise1 = {
  description: 'Running',
  duration: 30,
  date: '2023-10-01'
}

const exercise2 = {
  description: 'Swimming',
  duration: 45,
  date: '1999-10-01'
}

const exercise3 = {
  description: 'Cycling',
  duration: 60,
  date: '2022-01-02'
}

beforeAll(async () => {

  vi.stubEnv('DB_PORT', 5432 + Number(process.env.VITEST_WORKER_ID));

  container = await setupContainer()
  
  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs');
  app = mod.app;

  const res = await request(app).post('/api/users').send({ username: username })
  id_testuser = res.body._id

}, 60_000)

afterAll(async () => {
  if (container) {
    await container.stop();
  }
  vi.unstubAllEnvs()
})

describe('/api/users/:id/logs', () => {
  it('Get logs for user with no exercises', async () => {
    const res = await request(app).get(`/api/users/${id_testuser}/logs`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      "_id": id_testuser,
      "username": username,
      "count": 0,
      "log": []
    })
  })

  it('Get logs for user with exercises', async () => {

    await request(app).post(`/api/users/${id_testuser}/exercises`).send(exercise1)

    const res = await request(app).get(`/api/users/${id_testuser}/logs`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      "_id": id_testuser,
      "username": username,
      "count": 1,
      "log": [{
        "description": exercise1.description,
        "duration": exercise1.duration,
        "date": new Date(exercise.date1).toDateString()
      }]
    })
  })

  it('Get logs for user with multiple exercises', async () => {

    await request(app).post(`/api/users/${id_testuser}/exercises`).send(exercise2)
    await request(app).post(`/api/users/${id_testuser}/exercises`).send(exercise3)

    const res = await request(app).get(`/api/users/${id_testuser}/logs`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      "_id": id_testuser,
      "username": username,
      "count": 3,
      "log": [
        {
          "description": exercise1.description,
          "duration": exercise1.duration,
          "date": new Date(exercise1.date).toDateString()
        },
        {
          "description": exercise2.description,
          "duration": exercise2.duration,
          "date": new Date(exercise2.date).toDateString()
        },
        {
          "description": exercise3.description,
          "duration": exercise3.duration,
          "date": new Date(exercise3.date).toDateString()
        }
      ]
    })
  })

  it('Limit exercises in logs', async () => {
    const res = await request(app).get(`/api/users/${id_testuser}/logs?limit=1`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      "_id": id_testuser,
      "username": username,
      "count": 2,
      "log": [
        {
          "description": exercise1.description,
          "duration": exercise1.duration,
          "date": new Date(exercise1.date).toDateString()
        },
        {
          "description": exercise2.description,
          "duration": exercise2.duration,
          "date": new Date(exercise2.date).toDateString()
        }
      ]
    })
  })

  it('Use incorrect limit in logs', async () => {
    const res = await request(app).get(`/api/users/${id_testuser}/logs?limit=notanumber`)

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Limit must be a number' })
  })

})