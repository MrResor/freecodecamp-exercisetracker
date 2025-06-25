import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { setupContainer } from './container.mjs'

let app, container, port

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

describe('/api/docs', () => {
  it('should return redirect', async () => {
    const res = await request(app).get('/api/docs')

    expect(res.statusCode).toBe(301)
    expect(res.text).toContain('<title>Redirecting</title>')
  })

  it('should return docs page', async () => {
    const res = await request(app).get('/api/docs').redirects(1)

    expect(res.statusCode).toBe(200)
    expect(res.text).toContain('<title>Swagger UI</title>')
  })
})
