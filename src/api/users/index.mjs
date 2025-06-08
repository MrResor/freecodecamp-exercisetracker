import express from 'express'

import { db } from '../../db.mjs'

const users = express.Router()

const path = '/api/users'

users.post(path, async (req, res) => {
  const { username } = req.body

  // sanitize inputs
  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }

  const response = await db.add_user(username)

  res.status(response[0]).json(response[1])
})

users.get(path, async (_, res) => {
  const response = await db.get_users()
  res.status(200).json(response)
})

export { users }
