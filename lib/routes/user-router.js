const express = require('express')
const { knex } = require('../../db/knex-db-connection')
const { ResourceNotFoundError, UserNameEmptyError } = require('../errors')

const router = express.Router()

router.get('/', (req, res, next) => {
  knex('users').select('*')
    .then((users) => {
      res.json({ users })
    })
    .catch(next)
})

router.use('/:userId', (req, res, next) => {
  const userId = req.params.userId

  knex('users')
    .select('*')
    .where('id', userId)
    .first()
    .then((user) => {
      if (user === undefined) {
        throw new ResourceNotFoundError()
      }
      req.user = user
      next()
    })
    .catch(next)
})

router.get('/:userId', (req, res, next) => {
  const user = req.user

  res.json({ user })
})

router.post('/', (req, res, next) => {
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

router.get('/:userId/shoes', (req, res, next) => {
  const user = req.user

  knex('shoes')
    .select('shoes.id', 'shoes.brand', 'shoes.model')
    .innerJoin('users', 'users.id', 'shoes.user_id')
    .where('users.id', user.id)
    .then((userShoes) => {
      res.json({ shoes: userShoes })
    })
    .catch(next)
})

router.post('/:userId/shoes', (req, res, next) => {
  const user = req.user
  const shoeData = req.body

  return knex('shoes')
    .insert({ user_id: user.id, brand: shoeData.brand, model: shoeData.model })
    .returning([ 'id', 'brand', 'model' ])
    .then((createdShoes) => {
      const createdShoe = createdShoes[0]
      res.json({ shoe: createdShoe })
    })
    .catch(next)
})

router.get('/:userId/collection-value', (req, res, next) => {
  const user = req.user

  knex('shoes')
    .select('shoes.id', 'shoes.brand', 'shoes.model')
    .where('shoes.user_id', user.id)
    .then((userShoes) => {
      const totalValue = userShoes.reduce((value, shoe) => {
        switch (shoe.brand) {
          case 'Bacoste':
            return value + 150
          case 'Bucci':
            return value + 250
          default:
            return value + 100
        }
      }, 0)
      res.json({ value: totalValue })
    })
    .catch(next)
})

router.delete('/:userId', (req, res, next) => {
  const user = req.user

  return knex('users')
    .where('id', user.id)
    .del()
    .then(() => {
      res.status(204).send()
    })
    .catch(next)
})

module.exports = router
