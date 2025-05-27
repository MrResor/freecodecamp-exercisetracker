import { describe, it, expect } from 'vitest'
import request from 'supertest'

import { app } from '../src/express.mjs'

describe('/api/hello', () => {
  it('should say hello', async () => {
    const res = await request(app).get('/api/hello')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ greeting: 'hello API' })
  })
})
