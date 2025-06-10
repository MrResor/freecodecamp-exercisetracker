import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { setupContainer } from './container.mjs'

let app, container, port

beforeAll(async () => {
  [container, port] = await setupContainer(5432 + Number(process.env.VITEST_WORKER_ID))

  vi.stubEnv('DB_PORT', port.toString())

  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs')
  app = mod.app
}, 60_000)

afterAll(async () => {
  if (container) {
    await container.stop()
  }
  vi.unstubAllEnvs()
})

describe('/', () => {
  it('should return mainpage', async () => {
    const res = await request(app).get('/')

    expect(res.statusCode).toBe(200)
    expect(res.text).toContain('<title>Exercise Tracker | freeCodeCamp</title>')
  })

  it('should return 404 for non-existing route', async () => {
    const res = await request(app).get('/non-existing-route')

    expect(res.statusCode).toBe(404)
    expect(res.text).toContain('<title>Error</title>')
    expect(res.headers['content-type']).toContain('text/html')
    expect(res.text).toContain('Cannot GET /non-existing-route')
  })

  it('should return 404 for non-existing API route', async () => {
    const res = await request(app).get('/api/non-existing-route')

    expect(res.statusCode).toBe(404)
    expect(res.text).toContain('<title>Error</title>')
    expect(res.headers['content-type']).toContain('text/html')
    expect(res.text).toContain('Cannot GET /api/non-existing-route')
  })
})

describe('/style.css', () => {
  it('should return style.css', async () => {
    const res = await request(app).get('/style.css')

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toContain('text/css')
    expect(res.text).toContain('body')
  })
})
