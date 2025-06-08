import fs from 'fs'

import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'

const file = fs.readFileSync('documentation.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const docs = express.Router()

docs.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export { docs }
