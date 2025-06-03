import 'dotenv/config';
import request from 'supertest'
import { GenericContainer, Wait } from 'testcontainers'
import { describe, it, expect, beforeAll } from 'vitest'

let buildtContainer, container, app

beforeAll(async () => {
  buildtContainer = await GenericContainer
  .fromDockerfile(".", "Dockerfile_db")
  .build()

  container = await buildtContainer.withEnvironment({
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    PGUSER: process.env.USER_LOGIN,
    PGPASSWORD: process.env.USER_PASSWORD,
  })
  .withExposedPorts(5432)
  .withHealthCheck({
    test: ["CMD-SHELL", "pg_isready -U ${PGUSER} -d exercise_tracker"],
    interval: 10_000,
    retries: 20,
    start_interval: 30_000,
    timeout: 3_000
  })
  .withWaitStrategy(Wait.forHealthCheck())
  .withNetworkMode('host')
  .start()

  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs');
  app = mod.app;

}, 60_000)

describe('/api/users', () => {
  it('No users in database', async () => {
    const res = await request(app).get('/api/users')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual([])
  })
  // ADD USER
  it('Add user', async () => {
    const res = await request(app).post('/api/users').send({ username: 'testuser' })

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: expect.stringMatching(/id_[0-9]+$/),
      username: 'testuser',
    })
  })
  // GET ONE USER
  it("Get one user", async () => {
    const res = await request(app).get('/api/users')

    expect(res.statusCode).toBe(201)
    expect(res.body.length).toBe(1)
    expect(res.body[0]).toEqual({
      _id: "id_1",
      username: 'testuser',
    })
  })
  // TRY TO ADD THE SAME USER AGAIN
  it('Try to add the same user again', async () => {
    const res = await request(app).post('/api/users').send({ username: 'testuser' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: 'id_1',
      username: 'testuser',
    })
  })
  // ADD NEXT USER
  // GET ALL USERS
  // TRY TO ADD USER WITH EMPTY NAME
})