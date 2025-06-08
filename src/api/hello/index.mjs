import express from 'express'

const hello = express.Router()

hello.get('/api/hello', function (_, res) {
  res.status(200).json({ greeting: 'hello API' })
})

export { hello }
