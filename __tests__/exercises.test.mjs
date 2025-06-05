import request from 'supertest'
import { describe, it, expect, beforeAll } from 'vitest'

import { setupContainer } from './container.mjs'
import { add } from 'winston'

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
  
  it('add exercise without any data', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({})
    
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without description and duration', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without duration and date', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({
      description: 'test exercise without duration and date'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without description and date', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({
      duration: 45
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without duration', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({
      description: 'test exercise without duration',
      date: '2023-10-02'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without description and date', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({
      duration: 60
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without date', async () => {
    const res = await request(app).post(`/api/users/${id_testuser}/exercises`).send({
      description: 'test exercise without date',
      duration: 60
    })

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: id_testuser,
      username: username,
      date: new Date().toDateString(),
      duration: 60,
      description: 'test exercise without date'
    })
  })

})
