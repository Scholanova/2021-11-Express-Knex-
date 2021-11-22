const express = require('express')
const { knex } = require('../db/knex-db-connection')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/status', function (req, res) {
  res.send({ status: 'ok' })
})

app.get('/users', (req, res) => {
  knex('users').select('*')
    .then((users) => {
      res.json({ users })
    })
})

module.exports = app
