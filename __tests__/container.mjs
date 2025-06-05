import 'dotenv/config'
import { GenericContainer, Wait } from 'testcontainers'

async function setupContainer() {
  console.log(`Port: ${process.env.DB_PORT}`)

  Container
  .fromDockerfile(".", "Dockerfile_db")
  .build()
  
  const container = await buildtContainer.withEnvironment({
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    PGUSER: process.env.USER_LOGIN,
    PGPASSWORD: process.env.USER_PASSWORD,
  })
  .withExposedPorts(process.env.DB_PORT)
  .withWaitStrategy(Wait.forLogMessage('[1] LOG:  database system is ready to accept connections'))
  .withNetworkMode('host')
  .start()

  return container
}

export { setupContainer}