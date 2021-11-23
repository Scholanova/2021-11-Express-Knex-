const express = require('express')
const { knex } = require('../db/knex-db-connection')
const { ResourceNotFoundError, UserNameEmptyError } = require('./errors')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/status', function (req, res) {
  res.send({ status: 'ok' })
})

app.get('/users', (req, res, next) => {
  knex('users').select('*')
    .then((users) => {
      res.json({ users })
    })
    .catch(next)
})


app.get('/users/:userId', (req, res, next) => {
  const userId = req.params.userId

  knex('users')
    .select('*')
    .where('id', userId)
    .first()
    .then((user) => {
      if (user === undefined) {
        throw new ResourceNotFoundError()
      }
      res.json({ user })
    })
    .catch(next)
})


app.post('/users', (req, res, next) => {
  const name = req.body.name
  const isNameEmpty = name.length === 0

  if (isNameEmpty) {
    next(new UserNameEmptyError())
    return
  }

  knex('users').insert({ name }).returning([ 'id', 'name' ])
    .then((createdUsers) => {
      const createdUser = createdUsers[0]
      res.json({ user: createdUser })
    })
    .catch(next)
})

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
