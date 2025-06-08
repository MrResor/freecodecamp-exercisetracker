import pg from 'pg'
import 'dotenv/config'
import 'JSON'

import { dbLogger } from './logger.mjs'

const { Pool } = pg

async function errors (err) {
  switch (err.code) {
    case '57P01': // admin shutdown
      if (process.env.NODE_ENV !== 'test') {
        dbLogger.error('Database connection was closed by the server')
        await new Promise(resolve => setTimeout(resolve, 5000))
        process.exit(1)
      }
      break
    default:
      if (!(process.env.NODE_ENV === 'test' && err.message === 'Connection terminated unexpectedly')) {
        dbLogger.error('Unknown error occurred: ' + err.message)
        await new Promise(resolve => setTimeout(resolve, 5000))
        process.exit(1)
      }
  }
}

class Database {
  constructor () {
    this.Pool = new Pool({
      user: process.env.USER_LOGIN,
      password: process.env.USER_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: 'exercise_tracker'
    })

    this.Pool.on('connect', (_client) => {
      // On each new client initiated, need to register for error(this is a serious bug on pg, the client throw errors although it should not)
      _client.on('error', (err) => {
        errors(err)
      })
    })

    this.Pool.on('error', (err) => {
      errors(err)
    })
  }

  async connect () {
    try {
      await this.Pool.connect()
      dbLogger.info('Connected to the database')
    } catch (error) {
      dbLogger.error(`Error connecting to the database: ${error.message}`)
      throw error
    }
  }

  async add_user (username) {
    let code, result
    dbLogger.info(`INSERT INTO users (USERNAME) VALUES (${username}) RETURNING ID`)
    try {
      result = await this.Pool.query('INSERT INTO users (USERNAME) VALUES ($1) RETURNING _ID', [username])
      dbLogger.info(`Result: ${JSON.stringify(result.rows[0])}`)
      code = 201
    } catch (error) {
      dbLogger.info('UNIQUE key violated')
      result = await this.Pool.query('SELECT _ID FROM users WHERE USERNAME=$1', [username])
      dbLogger.info(`SELECT _ID FROM users WHERE USERNAME=${username}`)
      dbLogger.info(`Result: ${JSON.stringify(result.rows[0])}`)
      code = 200
    }
    const res = result.rows[0]
    res.username = username
    return [code, res]
  }

  async get_users () {
    const result = await this.Pool.query('SELECT _ID, USERNAME FROM users')
    dbLogger.info('SELECT _ID, USERNAME FROM users')
    dbLogger.info(`Result: ${JSON.stringify(result.rows)}`)
    return result.rows
  }

  async add_exercise (id, description, duration, date) {
    let result = await this.Pool.query('SELECT * FROM USERS WHERE _ID=$1', [id])
    dbLogger.info(`SELECT * FROM USERS WHERE _ID=${id}`)
    dbLogger.info(`Result: ${JSON.stringify(result.rows[0])}`)
    if (result.rowCount === 0) {
      return [404]
    }
    const username = result.rows[0].username
    result = await this.Pool.query('INSERT INTO exercises (USER_ID, DESCRIPTION, DURATION, DATE) VALUES ($1, $2, $3, $4) RETURNING _ID', [id, description, duration, date])
    dbLogger.info(`INSERT INTO exercises (USER_ID, DESCRIPTION, DURATION, DATE) VALUES (${id}, ${description}, ${duration}, ${date}) RETURNING _ID`)
    dbLogger.info(`Result: ${JSON.stringify(result.rows[0])}`)
    return [201, username]
  }

  async get_logs (id, from, to, limit) {
    let result = await this.Pool.query('SELECT * FROM USERS WHERE _ID=$1', [id])
    dbLogger.info(`SELECT * FROM USERS WHERE _ID=${id}`)
    dbLogger.info(`Result: ${JSON.stringify(result.rows[0])}`)
    if (result.rowCount === 0) {
      return [404]
    }
    const username = result.rows[0].username
    let query = 'SELECT description, duration, date FROM EXERCISES WHERE USER_ID=$1'
    let log = `SELECT description, duration, date FROM EXERCISES WHERE USER_ID=${id}`
    const params = [id]
    let i = 2
    if (from) {
      query += ` AND DATE >= $${i}`
      params.push(from)
      i += 1
      log += ` AND DATE >= ${from}`
    }
    if (to) {
      query += ` AND DATE <= $${i}`
      params.push(to)
      i += 1
      log += ` AND DATE <= ${to}`
    }
    if (limit) {
      query += ` LIMIT $${i}`
      params.push(limit)
      log += ` LIMIT ${limit}`
    }
    result = await this.Pool.query(query, params)
    dbLogger.info(log)
    dbLogger.info(`Result: ${JSON.stringify(result.rows)}`)
    return [200, username, result.rowCount, result.rows]
  }
}

const db = new Database()

await db.connect()

export { db }
