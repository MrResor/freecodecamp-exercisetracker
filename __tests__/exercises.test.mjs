import 'dotenv/config';
import request from 'supertest'
import { GenericContainer, Wait } from 'testcontainers'
import { describe, it, expect, beforeAll } from 'vitest'

let buildtContainer, container, app, id_testuser

const username = 'testuser'

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

  const res = await request(app).post('/api/users').send({ username: username })
  id_testuser = res.body._id

}, 60_000)

describe('/api/users/:id/exercises', () => {
  it('add exercise to an existing user', async () => {
    const res = await request(app).get(`/api/users/${id_testuser}/exercises`).send({
      description: 'test exercise',
      duration: 30,
      date: '2023-10-01'
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: id_testuser,
      username: username,
      date: '2023-10-01',
      duration: 30,
      description: 'test exercise'
    })
  })
})
