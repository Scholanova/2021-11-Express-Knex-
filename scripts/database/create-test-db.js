require('dotenv').config()
const { Client } = require('pg')

const PG_DATABASE_DUPLICATE_ERROR_CODE = '42P04'

if (process.env.NODE_ENV !== 'test') {
  throw `Script only works for test database, but process env was: ${
    process.env.NODE_ENV
  }`
}

const client = new Client({
  user: process.env.DB_TEST_USER,
  host: process.env.DB_TEST_HOST,
  database: 'postgres',
  password: process.env.DB_TEST_PASSWORD,
})

client.connect()

client
  .query(`CREATE DATABASE "${process.env.DB_TEST_DATABASE}";`)
  .then(() => console.log('db created'))
  .catch(error => {
    if (error.code === PG_DATABASE_DUPLICATE_ERROR_CODE) {
      console.log(error.message)
    } else {
      console.error(error)
    }
  })
  .then(() => client.end())
