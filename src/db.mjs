import pg from 'pg';
import 'dotenv/config';
import 'JSON';

import { db_logger } from './logger.mjs';

const { Pool } = pg;

class Database {

  constructor() {
    console.log('Database constructor');
    this.Pool = new Pool({
      user: process.env.USER_LOGIN,
      password: process.env.USER_PASSWORD,
      host: process.env.DB_HOST,
      port: 5432,
      database: 'exercise_tracker',
    });
    console.log(this.Pool)
  }

  async connect() {
    try {
      await this.Pool.connect();
      db_logger.info('Connected to the database');
    } catch (error) {
      db_logger.error(`Error connecting to the database: ${error.message}`);
      throw error;
    }
  }

  async add_user(username) {
    var code;
    db_logger.info(`INSERT INTO users (USERNAME) VALUES (${username}) RETURNING ID`);
    try {
      var result = await this.Pool.query('INSERT INTO users (USERNAME) VALUES ($1) RETURNING _ID', [username]);
      db_logger.info(`Result: ${JSON.stringify(result.rows[0])}`);
      code = 201
    } catch (error) {
      db_logger.info('UNIQUE key violated');
      result = await this.Pool.query('SELECT _ID FROM users WHERE USERNAME=$1', [username]);
      db_logger.info(`SELECT _ID FROM users WHERE USERNAME=${username}`);
      db_logger.info(`Result: ${JSON.stringify(result.rows[0])}`);
      code = 200
    }
    let res = result.rows[0];
    res.username = username;
    return [code, res];
  }

  async get_users() {
    let result = await this.Pool.query('SELECT _ID, USERNAME FROM users');
    db_logger.info('SELECT _ID, USERNAME FROM users');
    db_logger.info(`Result: ${JSON.stringify(result.rows)}`);
    return result.rows;
  }

  async add_exercise(id, description, duration, date) {
    let result = await this.Pool.query('SELECT * FROM USERS WHERE _ID=$1', [id]);
    db_logger.info(`SELECT * FROM USERS WHERE _ID=${id}`);
    db_logger.info(`Result: ${JSON.stringify(result.rows[0])}`);
    if (result.rowCount === 0) {
      return [404];
    }
    const username = result.rows[0].username;
    result = await this.Pool.query('INSERT INTO exercises (USER_ID, DESCRIPTION, DURATION, DATE) VALUES ($1, $2, $3, $4) RETURNING _ID', [id, description, duration, date]);
    db_logger.info(`INSERT INTO exercises (USER_ID, DESCRIPTION, DURATION, DATE) VALUES (${id}, ${description}, ${duration}, ${date}) RETURNING _ID`);
    db_logger.info(`Result: ${JSON.stringify(result.rows[0])}`);
    return [201, username];
  }

  async get_logs(id, from, to, limit) {
    let result = await this.Pool.query('SELECT * FROM USERS WHERE _ID=$1', [id]);
    db_logger.info(`SELECT * FROM USERS WHERE _ID=${id}`);
    db_logger.info(`Result: ${JSON.stringify(result.rows[0])}`);
    if (result.rowCount === 0) {
      return [404];
    }
    const username = result.rows[0].username;
    let query = 'SELECT description, duration, date FROM EXERCISES WHERE USER_ID=$1';
    let log = `SELECT description, duration, date FROM EXERCISES WHERE USER_ID=${id}`
    let params = [id];
    let i = 2;
    if (from) {
      query += ` AND DATE >= $${i}`;
      params.push(from);
      i += 1;
      log += ` AND DATE >= ${from}`;
    }
    if (to) {
      query += ` AND DATE <= $${i}`;
      params.push(to);
      i += 1;
      log += ` AND DATE <= ${to}`;
    }
    if (limit) {
      query += ` LIMIT $${i}`;
      params.push(limit);
      log += ` LIMIT ${limit}`;
    }
    result = await this.Pool.query(query, params);
    db_logger.info(log);
    db_logger.info(`Result: ${JSON.stringify(result.rows)}`);
    return [200, username, result.rowCount, result.rows];
  }
}

const db = new Database()

await db.connect()

export { db };