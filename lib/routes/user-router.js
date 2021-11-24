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


module.exports = router;
