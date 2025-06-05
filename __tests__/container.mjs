import 'dotenv/config'
import { GenericContainer, Wait } from 'testcontainers'

async function setupContainer() {
  console.log('PORT', process.env.DB_PORT)

  const buildtContainer = await GenericContainer
  .fromDockerfile(".", "Dockerfile_db")
  .build()
  
  const container = await buildtContainer.withEnvironment({
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    PGUSER: process.env.USER_LOGIN,
    PGPASSWORD: process.env.USER_PASSWORD,
    PGPORT: Number(process.env.DB_PORT),
  })
  .withExposedPorts(Number(process.env.DB_PORT))
  .withWaitStrategy(Wait.forLogMessage('[1] LOG:  database system is ready to accept connections'))
  .start()

  const port = container.getFirstMappedPort()
  
  console.log(`Container started on port ${port}`)
  
  return container
}

export { setupContainer}