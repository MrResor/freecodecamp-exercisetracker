import 'dotenv/config';
import request from 'supertest'
import { GenericContainer, Wait } from 'testcontainers'
import { describe, it, expect, beforeAll } from 'vitest'

import {exec} from 'node:child_process'

let buildtContainer, container,  app

async function cleanupContainer() {
  exec('docker stop $(docker ps -a -q) || true', (err, stdout, stderr) => { })
}

async function setupContainer() {
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
}

beforeAll(async () => {
  
  await cleanupContainer()

  await setupContainer()
  
  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs');
  app = mod.app;

}, 60_000)

describe('/api/hello', () => {
  it('should say hello', async () => {
    const res = await request(app).get('/api/hello')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ greeting: 'hello API' })
  })
})