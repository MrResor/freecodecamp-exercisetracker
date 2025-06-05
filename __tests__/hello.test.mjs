import 'dotenv/config';
import request from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { setupContainer } from './container.mjs'

let container,  app


beforeAll(async () => {

  vi.stubEnv('DB_PORT', 5432 + Number(process.env.VITEST_WORKER_ID));

  container = await setupContainer()
  
  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs');
  app = mod.app;

}, 60_000)

afterAll(async () => {
  if (container) {
    await container.stop();
  }
  vi.unstubAllEnvs()
})

describe('/api/hello', () => {
  it('should say hello', async () => {
    const res = await request(app).get('/api/hello')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ greeting: 'hello API' })
  })
})