import cors from 'cors'
import express from 'express'
import path from 'path'

import { docs } from './api/docs/index.mjs'
import { hello } from './api/hello/index.mjs'
import { exercises } from './api/users/:id/exercises/index.mjs'
import { users } from './api/users/index.mjs'
import { logs } from './api/users/:id/logs/index.mjs'
import { mainView } from './index.mjs'
import { logger } from './logger.mjs'

const app = express()
const router = express.Router()
const __dirname = import.meta.dirname

// Middleware declaration

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
router.use(cors({ optionsSuccessStatus: 200 })) // some legacy browsers choke on 204

// body parser declaration
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// http://expressjs.com/en/starter/static-files.html
router.use(express.static(path.join(__dirname, '..', 'public')))

router.use((req, _, next) => {
  let hasRouteToHandle = null
  router.stack.forEach((stackItem) => {
    // check if current rout path matches route request path
    if (stackItem.handle?.stack !== undefined) {
      stackItem?.handle.stack.forEach((innerItem) => {
        if (innerItem.regexp.test(req.path)) {
          hasRouteToHandle = true
        }
      })
    }
  })

  const ip = Object.hasOwn(req.headers, 'x-forwarded-for') ? req.headers['x-forwarded-for'] : req.ip
  let query = ''
  let i = 0
  for (const [key, value] of Object.entries(req.query)) {
    if (i === 0) {
      query += '?'
    } else {
      query += '&'
    }
    query += `${key}=${value}`
    i++
  }

  const msg = `${req.method} ${req.path}${query} - ${ip}`

  if (hasRouteToHandle) {
    logger.http(msg)
  } else {
    // No matching route for this request
    logger.error(msg)
  }

  next()
})

// Routes declaration

// /
router.use(mainView)
// /api/hello
router.use(hello)
// /api/docs
router.use(docs)
// /api/users
router.use(users)
// /api/users/:id/exercises
router.use(exercises)
// /api/users/:id/logs
router.use(logs)

app.use(router)

export { app }
