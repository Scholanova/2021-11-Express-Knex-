const express = require('express');
const { knex } = require('../../db/knex-db-connection')
const { ResourceNotFoundError, UserNameEmptyError } = require('../errors')

const router = express.Router();

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

router.post('/:userId/shoes', (req, res, next) => {
  const userId = req.params.userId
  const model = req.body.model
  const brand = req.body.brand

  knex('shoes').insert({ model: model, brand: brand, user_id: userId }).returning('*')
  .then((shoes) => {
    if (shoes === undefined | shoes.length === 0) {
      throw new ResourceNotFoundError()
    }
    res.json({ shoe: shoes[0] })
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

router.get('/:userId/collection-value', (req, res, next) => {

  const mapModel = new Map();

  mapModel.set('Bacoste', 150);
  mapModel.set('Bucci', 250);
  mapModel.set('any', 100);

  knex('shoes').select('*').where('user_id', req.params.userId)
    .then((shoe) => {
      shoesValue = 0
      for (let i=0; i < shoe.length; i++){
        if(mapModel.has(shoe[i].brand)){
          shoesValue += mapModel.get(shoe[i].brand)
      }else{
        shoesValue += mapModel.get('any')
      }
    }
    res.json({ value: shoesValue })
    })
})

router.delete('/:userId', (req, res, next) => {
  const user = req.user
  knex('users').where('id', user.id).del()
    .then(() => res.status(204).send())
    .catch(next)
})

module.exports = router;