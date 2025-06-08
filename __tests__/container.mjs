import 'dotenv/config'
import { GenericContainer, Wait } from 'testcontainers'

async function setupContainer(db_port) {

  const buildtContainer = await GenericContainer
  .fromDockerfile(".", "Dockerfile_db")
  .build()
  
  const container = await buildtContainer.withEnvironment({
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    PGUSER: process.env.USER_LOGIN,
    PGPASSWORD: process.env.USER_PASSWORD,
    PGPORT: Number(db_port),
  })
  .withExposedPorts(Number(db_port))
  .withWaitStrategy(Wait.forLogMessage('[1] LOG:  database system is ready to accept connections'))
  .start()

  const port = container.getMappedPort(Number(db_port))

  return container, port
}

export { setupContainer}