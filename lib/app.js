const express = require('express')
const { knex } = require('../db/knex-db-connection')
const { ResourceNotFoundError, UserNameEmptyError } = require('./errors')
const userRouter = require('./routes/user-router')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/status', function (req, res) {
  res.send({ status: 'ok' })
})

app.use('/users', userRouter)

app.use('/brands', (req, res, next) => {
  knex('shoes')
    .distinct('shoes.brand')
    .pluck('brand')
    .then((brands) => {
      res.json({ brands: brands.sort() })
    })
    .catch(next)
})

app.use('/models', (req, res, next) => {
  const brand = req.query.brand

  knex('shoes').distinct('shoes.model')
    .where((builder) => {
      if (brand) {
        builder.where({ brand })
      }
      return builder
    })
    .then((modelList) => {
      const models = modelList
        .map(({ model }) => model)
        .sort()
      res.json({ models })

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
