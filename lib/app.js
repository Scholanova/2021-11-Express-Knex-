const express = require('express')
const { knex } = require('../db/knex-db-connection')
const { ResourceNotFoundError, UserNameEmptyError } = require('./errors')
const userRouter = require('./routes/user-router')
const shoesRouter = require('./routes/shoes-router')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/status', function (req, res) {
  res.send({ status: 'ok' })
})

app.use('/users', userRouter)

app.use('/shoes', shoesRouter)

app.use((error, req, res, next) => {
  switch (error.constructor) {
    case ResourceNotFoundError:
      res.status(404).json({ error: 'User not found' })
      break
    case UserNameEmptyError:
      res.status(422).json({ error: 'User name cannot be empty' })
      break
    default:
      console.error(error)
      res.status(500).json({ error: 'server error' })
  }
})

module.exports = app
