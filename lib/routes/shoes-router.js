const express = require('express');
const { knex } = require('../../db/knex-db-connection')
const { ResourceNotFoundError, UserNameEmptyError } = require('../errors')

const router = express.Router();

router.post('/', (req, res, next) => {
    const brand = req.body.brand
    const model = req.body.model
    const isNameEmpty = name.length === 0
  
    if (isNameEmpty) {
      next(new UserNameEmptyError())
      return
    }
  
    knex('shoes').insert({ brand, model, user_id }).returning([ 'id','brand', 'model', 'user_id' ])
      .then((createdShoes) => {
        const createdShoe = createdShoes[0]
        res.json({ user: createdShoe })
      })
      .catch(next)
  })
  


module.exports = router;