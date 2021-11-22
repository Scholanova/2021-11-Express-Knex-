const knexConfigs = require('./knexfile')
const env = process.env.NODE_ENV

const knexEnv = (environnement => {
  if (environnement === 'production' || environnement === 'staging') {
    return 'production'
  } else if (environnement === 'test') {
    return 'test'
  } else {
    return 'development'
  }
})(env)

const knex = require('knex')(knexConfigs[knexEnv])

module.exports = {
  knex,
}
