import 'dotenv/config';
import request from 'supertest'
import { GenericContainer, TestContainers } from 'testcontainers'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { app } from '../src/express.mjs'

let container = await GenericContainer
  .fromDockerfile(".", "Dockerfile_db")
  .build()

beforeAll(async () => {

  container = await container.withEnvironment({
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    PGUSER: process.env.USER_LOGIN,
    PGPASSWORD: process.env.USER_PASSWORD,
  })
  .withTmpFs({ "/var/lib/postgresql/data": "rw" })
  .withExposedPorts(5432)
  .start()
  
  container.getMappedPort(5432)

}, 10_000)

afterAll(async () => {
  await container.stop()
  await container.remove()
})

describe('/api/users', () => {
  it('No users in database', async () => {
    const res = await request(app).get('/api/users')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual([])
  })
  // ADD USER
  it('Add user', async () => {
    const res = await request(app).post('/api/users').send({ username: 'testuser1' })

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      _id: 'id_' + expect.any(Number),
      username: 'testuser'
    })
  })
  // GET ONE USER
  // TRY TO ADD THE SAME USER AGAIN
  // ADD NEXT USER
  // GET ALL USERS
  // TRY TO ADD USER WITH EMPTY NAME
})
