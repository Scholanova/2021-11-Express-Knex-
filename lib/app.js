const express = require('express')
const { knex } = require('../db/knex-db-connection')
const { ResourceNotFoundError, UserNameEmptyError } = require('./errors')
const userRouter = require('./routes/user-router')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/users', userRouter)

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

  knex('users').insert({ name }).returning(['id', 'name'])
    .then((createdUsers) => {
      const createdUser = createdUsers[0]
      res.json({ user: createdUser })
    })
    .catch(next)
})


app.get('/users/:userId/shoes', (req, res, next) => {
  const userId = req.params.userId

  knex('shoes')
    .select(['shoes.brand', 'shoes.id', 'shoes.model'])
    .innerJoin('users', 'shoes.user_id', 'users.id')
    .where('users.id', userId)
    .then((shoes) => {
      if (shoes === undefined | shoes.length === 0) {
        throw new ResourceNotFoundError()
      }
      res.json({ shoes })
    })
    .catch(next)
})


app.post('/users/:userId/shoes', (req, res, next) => {
  const userId = req.params.userId

  knex('shoes').insert({ model: req.body.model, brand: req.body.brand, user_id: userId }).returning('*')
    .then((shoes) => {
      if (shoes === undefined | shoes.length === 0) {
        throw new ResourceNotFoundError()
      }
      res.json({ shoe: shoes[0] })
    })
    .catch(next)
})


// Question 10
// Calculer la valeur de la collection de chaussure d'un utilisateur
// Les chaussures qu'ils a valent toute 100 de base,
// mais les Bacoste valent 150
// et les Bucci valent 250
// Body de retour : { value: 200 }
app.get('/users/:userId/collection-value', (req, res, next) => {
  const userId = req.params.userId

  knex('shoes')
    .select(['shoes.brand', 'shoes.id', 'shoes.model'])
    .innerJoin('users', 'shoes.user_id', 'users.id')
    .where('users.id', userId)
    .then((shoes) => {

      let value = 0
      shoes.forEach((shoe) => {
        if (shoe.brand == 'Bacoste') {
          value += 150
        } else if (shoe.brand == 'Bucci') {
          value += 250
        } else {
          value += 100
        }
      });
      res.json({ value: value })
    })
    .catch(next)
})



app.delete('/users/:userId', (req, res, next) => {
  const userId = req.params.userId

  knex('users')
    .where('id', userId)
    .del().then(

      knex('users')
        .select('*')
        .where('id', userId)
        .first().then((deletedUser) => {
          if (deletedUser === undefined | deletedUser.length === 0) {
            throw new ResourceNotFoundError()
          }
        }),
      res.status(204).json({})
    )
    .catch(next)
})


// Question 13
// Lister toutes les différentes marques de chaussures des différents utilisateur
// ⚠️ ⚠️ ⚠️ Les marques seront ordonnées par ordre alphabétique ️⚠️ ⚠️ ⚠️
// GET /brands
// Body de retour : { brands: ['Baccoste', 'Rebokk'] }
app.get('/brands', (req, res, next) => {
  knex('shoes').distinct('brand').select('brand').orderBy('brand')
    .then((brands) => {

      var brandArray = new Array();
      brands.forEach((brand) => brandArray.push(brand.brand))
      res.json({ brands: brandArray })
    })
})

// Question 14
// Lister toutes les différentes modèles de chaussures
// ⚠️ ⚠️ ⚠️ Les modèles seront ordonnées par ordre alphabétique ️⚠️ ⚠️ ⚠️
// GET /models
// Status de retour : 200
// Body de retour : { models: ['Regular'] }
app.get('/models', (req, res, next) => {
  const brandQuery = req.query.brand
  knex('shoes').distinct('model').select('model', 'brand').orderBy('model')
    .then((shoes) => {
      let result = shoes
      if (brandQuery) result = result.filter(shoe => shoe.brand == brandQuery)
      result = result.map(shoe => shoe.model)
      res.json({ models: result })
    })
})

// Question 15
// Lister toutes les différentes modèles de chaussures pour une marque donnée existante en base
// Cela renvoi une liste avec les modèles en question
// ⚠️ ⚠️ ⚠️ Les modèles seront ordonnées par ordre alphabétique ️⚠️ ⚠️ ⚠️
// GET /models?brand=Bacoste
// Status de retour : 200
// Body de retour : { models: ['Regular'] }


// Middleware
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