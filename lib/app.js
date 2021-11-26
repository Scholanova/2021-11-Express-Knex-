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

app.get('/brands', function (req, res, next) {
  knex('shoes').distinct("brand").orderBy("brand")
  .then((brands) => {
    const result = brands.map(b => b.brand)
    res.json({ brands: result })
  })
  .catch(next)
})

app.get('/models', function (req, res, next) {
  const brand = req.query.brand
  knex('shoes').distinct("model").select("brand").orderBy("model")
  .then((shoes) => {
    let result = shoes 
    if(brand) { 
      result = result.filter(shoe => shoe.brand == brand)
    }
    result = result.map(shoe => shoe.model)
    res.json({ models: result })
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
