const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
})

if (process.env.NODE_ENV === 'test') {
  console.log('DB_TEST_HOST', process.env.DB_TEST_HOST)
} else if (process.env.NODE_ENV === 'development') {
  console.log('DB_HOST', process.env.DB_HOST)
}

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_TEST_HOST,
      user: process.env.DB_TEST_USER,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
  },
}
