import 'dotenv/config'
import { GenericContainer, Wait } from 'testcontainers'

async function setupContainer (dbPort) {
  const buildtContainer = await GenericContainer
    .fromDockerfile('.', 'Dockerfile_db')
    .build()

  const container = await buildtContainer.withEnvironment({
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    PGUSER: process.env.USER_LOGIN,
    PGPASSWORD: process.env.USER_PASSWORD,
    PGPORT: Number(dbPort)
  })
    .withExposedPorts(Number(dbPort))
    .withNetworkMode('host')
    .withWaitStrategy(Wait.forLogMessage('[1] LOG:  database system is ready to accept connections'))
    .start()

  return [container, dbPort]
}

export { setupContainer }
