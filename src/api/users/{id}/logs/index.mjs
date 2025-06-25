import express from 'express'

import { db } from '../../../../db.mjs'

const logs = express.Router()

logs.get('/api/users/:id/logs', async (req, res) => {
  const { id } = req.params
  let { from, to, limit } = req.query

  // sanitize inputs
  if (from !== undefined) {
    if (isNaN(Date.parse(from))) {
      return res.status(400).json({ error: 'From must be a valid date' })
    } else {
      from = new Date(from).toDateString()
    }
  }
  if (to !== undefined) {
    if (isNaN(Date.parse(to))) {
      return res.status(400).json({ error: 'To must be a valid date' })
    } else {
      to = new Date(to).toDateString()
    }
  }
  if (from && to) {
    if (new Date(from) > new Date(to)) {
      return res.status(400).json({ error: 'From date must be before To date' })
    }
  }
  if (limit !== undefined && isNaN(parseInt(limit))) {
    return res.status(400).json({ error: 'Limit must be a number' })
  }

  const request = await db.get_logs(id, from, to, limit)
  if (request[0] === 404) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.status(200).json({
    username: request[1],
    count: request[2],
    _id: id,
    log: request[3].map((exercise) => {
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
      }
    })
  })
})

export { logs }
