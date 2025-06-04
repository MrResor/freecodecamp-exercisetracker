import request from 'supertest'
import { describe, it, expect, beforeAll } from 'vitest'

import { setupContainer } from './container.mjs'

let container, app, id_testuser

const username = 'testuser'


beforeAll(async () => {

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
})

describe('/api/users/:id/exercises', () => {
  it('add exercise to an existing user', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({
      description: 'test exercise',
      duration: 30,
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: id_testuser,
      username: username,
      date: 'Sun Oct 01 2023',
      duration: 30,
      description: 'test exercise'
    })
  })
})
