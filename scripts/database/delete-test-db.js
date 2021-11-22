require('dotenv').config()
const { Client } = require('pg')

const PG_DATABASE_NON_EXISTANT_ERROR_CODE = '3D000'

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
  .query(`DROP DATABASE "${process.env.DB_TEST_DATABASE}";`)
  .then(() => console.log('db deleted'))
  .catch(error => {
    if (error.code === PG_DATABASE_NON_EXISTANT_ERROR_CODE) {
      console.log(error.message)
    } else {
      console.error(error)
    }
  })
  .then(() => client.end())
