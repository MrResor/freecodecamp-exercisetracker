import 'dotenv/config'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { setupContainer } from './container.mjs'

let app, container, idTestuser, port

const username = 'testuser'

const exercise1 = {
  description: 'Running',
  duration: 30,
  date: '2023-10-01'
}

const exercise2 = {
  description: 'Swimming',
  duration: 45,
  date: '1999-10-01'
}

const exercise3 = {
  description: 'Cycling',
  duration: 60,
  date: '2022-01-02'
}

const exercise4 = {
  description: 'Hiking',
  duration: 120,
  date: '2022-02-03'
}

beforeAll(async () => {
  [container, port] = await setupContainer(5432 + Number(process.env.VITEST_WORKER_ID))

  vi.stubEnv('DB_PORT', port.toString())

  // Import the app AFTER the container is up and env vars are set
  const mod = await import('../src/express.mjs')
  app = mod.app

  const res = await request(app).post('/api/users').send({ username })
  idTestuser = res.body._id
}, 60_000)

afterAll(async () => {
  if (container) {
    await container.stop()
  }
  vi.unstubAllEnvs()
})

describe('/api/users/:id/logs', () => {
  it('Get logs for user with no exercises', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 0,
      log: []
    })
  })

  it('Get logs for user with exercises', async () => {
    await request(app).post(`/api/users/${idTestuser}/exercises`).send(exercise1)

    const res = await request(app).get(`/api/users/${idTestuser}/logs`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 1,
      log: [{
        description: exercise1.description,
        duration: exercise1.duration,
        date: new Date(exercise1.date).toDateString()
      }]
    })
  })

  it('Get logs for user with multiple exercises', async () => {
    await request(app).post(`/api/users/${idTestuser}/exercises`).send(exercise2)
    await request(app).post(`/api/users/${idTestuser}/exercises`).send(exercise3)
    await request(app).post(`/api/users/${idTestuser}/exercises`).send(exercise4)

    const res = await request(app).get(`/api/users/${idTestuser}/logs`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 4,
      log: [
        {
          description: exercise1.description,
          duration: exercise1.duration,
          date: new Date(exercise1.date).toDateString()
        },
        {
          description: exercise2.description,
          duration: exercise2.duration,
          date: new Date(exercise2.date).toDateString()
        },
        {
          description: exercise3.description,
          duration: exercise3.duration,
          date: new Date(exercise3.date).toDateString()
        },
        {
          description: exercise4.description,
          duration: exercise4.duration,
          date: new Date(exercise4.date).toDateString()
        }
      ]
    })
  })

  it('Limit exercises in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?limit=2`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 2,
      log: [
        {
          description: exercise1.description,
          duration: exercise1.duration,
          date: new Date(exercise1.date).toDateString()
        },
        {
          description: exercise2.description,
          duration: exercise2.duration,
          date: new Date(exercise2.date).toDateString()
        }
      ]
    })
  })

  it('Use incorrect limit in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?limit=notanumber`)

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Limit must be a number' })
  })

  it('Use from date in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?from=2020-01-01`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 3,
      log: [
        {
          description: exercise1.description,
          duration: exercise1.duration,
          date: new Date(exercise1.date).toDateString()
        },
        {
          description: exercise3.description,
          duration: exercise3.duration,
          date: new Date(exercise3.date).toDateString()
        },
        {
          description: exercise4.description,
          duration: exercise4.duration,
          date: new Date(exercise4.date).toDateString()
        }
      ]
    })
  })

  it('Use to date in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?to=2022-12-31`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 3,
      log: [
        {
          description: exercise2.description,
          duration: exercise2.duration,
          date: new Date(exercise2.date).toDateString()
        },
        {
          description: exercise3.description,
          duration: exercise3.duration,
          date: new Date(exercise3.date).toDateString()
        },
        {
          description: exercise4.description,
          duration: exercise4.duration,
          date: new Date(exercise4.date).toDateString()
        }
      ]
    })
  })

  it('Use from and to dates in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?from=2022-01-01&to=2022-12-31`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 2,
      log: [
        {
          description: exercise3.description,
          duration: exercise3.duration,
          date: new Date(exercise3.date).toDateString()
        },
        {
          description: exercise4.description,
          duration: exercise4.duration,
          date: new Date(exercise4.date).toDateString()
        }
      ]
    })
  })

  it('Use from and to dates with limit in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?from=2022-01-01&to=2022-12-31&limit=1`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      _id: idTestuser,
      username,
      count: 1,
      log: [
        {
          description: exercise3.description,
          duration: exercise3.duration,
          date: new Date(exercise3.date).toDateString()
        }
      ]
    })
  })

  it('Use invalid from date in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?from=notadate`)

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'From must be a valid date' })
  })

  it('Use invalid to date in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?to=notadate`)

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'To must be a valid date' })
  })

  it('Use from date after to date in logs', async () => {
    const res = await request(app).get(`/api/users/${idTestuser}/logs?from=2023-01-01&to=2022-12-31`)

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'From date must be before To date' })
  })

  it('Use non-existent user id in logs', async () => {
    const res = await request(app).get('/api/users/999999/logs')

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'User not found' })
  })
})
