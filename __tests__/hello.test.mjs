import 'dotenv/config';
import request from 'supertest'
import { GenericContainer, Wait } from 'testcontainers'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

let buildtContainer, container, imageName, app

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
  
  imageName = container.getImageName // Save the image name

  //dbport = container.getMappedPort(5432)

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
