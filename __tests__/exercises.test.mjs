import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { setupContainer } from './container.mjs'

let app, container, idTestuser, port

const username = 'testuser'

beforeAll(async () => {
  [container, port] = await setupContainer(5432 + Number(process.env.VITEST_WORKER_ID))

  vi.stubEnv('DB_PORT', port.toString())
  vi.stubEnv('DB_HOST', 'localhost')

  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs')
  app = mod.app

  const res = await request(app).post('/api/users').send({ username })
  idTestuser = res.body._id
}, 60_000)

afterAll(async () => {
  if (container) await container.stop()
  vi.unstubAllEnvs()
})

describe('/api/users/:id/exercises', () => {
  it('add exercise to an existing user', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: 'test exercise',
      duration: 30,
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      date: 'Sun Oct 01 2023',
      duration: 30,
      description: 'test exercise'
    })
  })

  it('add exercise without any data', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({})

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without description and duration', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without duration and date', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: 'test exercise without duration and date'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without description and date', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      duration: 45
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without duration', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: 'test exercise without duration',
      date: '2023-10-02'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without description and date', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      duration: 60
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise without date', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: 'test exercise without date',
      duration: 60
    })

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      date: new Date().toDateString(),
      duration: 60,
      description: 'test exercise without date'
    })
  })

  it('add exercise with empty string as description', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: '',
      duration: 30,
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Description and duration are required'
    })
  })

  it('add exercise with empty string as duration', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: 'test exercise with empty duration',
      duration: '',
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Duration must be a number'
    })
  })

  it('add exercise with duration as a string', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: 'test exercise with string duration',
      duration: 'thirty',
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Duration must be a number'
    })
  })

  it('add exercise with invalid date format', async () => {
    const res = await request(app).post(`/api/users/${idTestuser}/exercises`).send({
      description: 'test exercise with invalid date',
      duration: 30,
      date: 'invalid-date'
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Date must be a valid date'
    })
  })

  it('add exercise to a non-existing user', async () => {
    const res = await request(app).post('/api/users/999999/exercises').send({
      description: 'test exercise for non-existing user',
      duration: 30,
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({
      error: 'User not found'
    })
  })
})
