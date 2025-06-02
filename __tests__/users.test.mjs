import 'dotenv/config';
import request from 'supertest'
import { GenericContainer, TestContainers } from 'testcontainers'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { app } from '../src/express.mjs'

let container = await GenericContainer
  .fromDockerfile(".", "Dockerfile_db")
  .build()

const imageName = builtContainer.getImageName() // Save the image name

beforeAll(async () => {

  container = await container.withEnvironment({
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    PGUSER: process.env.USER_LOGIN,
    PGPASSWORD: process.env.USER_PASSWORD,
  })
  .withExposedPorts(5432)
  .start()
  
  let dbport = container.getMappedPort(5432)

}, 10_000)

afterAll(async () => {
  await container.stop();
  if (imageName) {
    exec(`docker rmi -f ${imageName}`, (err, stdout, stderr) => {
      if (err) {
        console.error('Failed to remove image:', stderr);
      } else {
        console.log('Removed image:', imageName);
      }
    });
  }
});

describe('/api/users', () => {
  it('No users in database', async () => {
    const res = await request(app).get('/api/users')

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual([])
  })
  // ADD USER
  // it('Add user', async () => {
  //   const res = await request(app).post('/api/users').send({ username: 'testuser1' })

  //   expect(res.statusCode).toBe(201)
  //   expect(res.body).toEqual({
  //     _id: 'id_' + expect.any(Number),
  //     username: 'testuser'
  //   })
  // })
  // GET ONE USER
  // TRY TO ADD THE SAME USER AGAIN
  // ADD NEXT USER
  // GET ALL USERS
  // TRY TO ADD USER WITH EMPTY NAME
})
