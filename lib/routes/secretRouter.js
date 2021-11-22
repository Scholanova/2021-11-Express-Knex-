const router = require('express').Router()
const userRepository = require('../repositories/userRepository')

router.get('/', function (req, res, next) {
  res.send(`userId: ${req.userId}, req.params: ${JSON.stringify(req.params)}`)
})

module.exports = router
