import 'dotenv/config';
import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { setupContainer } from './container.mjs'

let container, app, id_testuser

const username = 'testuser'

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
    const exercise = {
      description: 'Running',
      duration: 30,
      date: '2023-10-01'
    }

    await request(app).post(`/api/users/${id_testuser}/exercises`).send(exercise)

    const res = await request(app).get(`/api/users/${id_testuser}/logs`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      "_id": id_testuser,
      "username": username,
      "count": 1,
      "log": [{
        "description": exercise.description,
        "duration": exercise.duration,
        "date": new Date(exercise.date).toDateString()
      }]
    })
  })

})