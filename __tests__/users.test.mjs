import 'dotenv/config'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { setupContainer } from './container.mjs'

let app, container, idNextuser, idTestuser, port

beforeAll(async () => {
  [container, port] = await setupContainer(5432 + Number(process.env.VITEST_WORKER_ID))

  vi.stubEnv('DB_PORT', port.toString())
  vi.stubEnv('DB_HOST', 'localhost')

  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs')
  app = mod.app
}, 60_000)

afterAll(async () => {
  if (container) await container.stop()
  vi.unstubAllEnvs()
})

describe('/api/users', () => {
  it('No users in database', async () => {
    const res = await request(app).get('/api/users')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual([])
  })
  // ADD USER
  it('Add user', async () => {
    const res = await request(app).post('/api/users').send({ username: 'testuser' })

    idTestuser = res.body._id

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: expect.stringMatching(/id_[0-9]+$/),
      username: 'testuser'
    })
  })
  // GET ONE USER
  it('Get one user', async () => {
    const res = await request(app).get('/api/users')

    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0]).toEqual({
      _id: idTestuser,
      username: 'testuser'
    })
  })
  // TRY TO ADD THE SAME USER AGAIN
  it('Try to add the same user again', async () => {
    const res = await request(app).post('/api/users').send({ username: 'testuser' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: 'id_1',
      username: 'testuser'
    })
  })
  // ADD NEXT USER
  it('Add next user', async () => {
    const res = await request(app).post('/api/users').send({ username: 'nextuser' })

    idNextuser = res.body._id

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: expect.stringMatching(/id_[0-9]+$/),
      username: 'nextuser'
    })
  })
  // GET ALL USERS
  it('Get all users', async () => {
    const res = await request(app).get('/api/users')

    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(2)
    expect(res.body[0]).toEqual({
      _id: idTestuser,
      username: 'testuser'
    })
    expect(res.body[1]).toEqual({
      _id: idNextuser,
      username: 'nextuser'
    })
  })
  // TRY TO ADD USER WITH EMPTY NAME
  it('Try to add user with empty name', async () => {
    const res = await request(app).post('/api/users').send({ username: '' })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Username is required' })
  })
  // TRY TO ADD USER WITHOUT NAME
  it('Try to add user without name', async () => {
    const res = await request(app).post('/api/users').send({})

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Username is required' })
  })
})
