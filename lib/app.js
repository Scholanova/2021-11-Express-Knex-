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

app.get('/brands', (req, res, next) => {
  knex('shoes').select('shoes.brand').pluck('brand').orderBy('brand').groupBy('brand')
    .then((shoe) => {
      console.log()
      res.json({ brands: shoe })
    })
})

app.get('/models', (req, res, next) => {
  knex('shoes').select('shoes.model').pluck('model').orderBy('model').groupBy('model')
    .then((model) => {
      console.log()
      res.json({ models: model })
    })
})

//J'ai la reponse pour la question 15 mais vu que je ne l'ai pas
//comprise, je prefere ne pas la mettre
module.exports = app
