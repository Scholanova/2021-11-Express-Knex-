const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const { knex } = require('../db/knex-db-connection')

chai.use(chaiHttp)
chai.use(require('sinon-chai'))
chai.use(require('chai-as-promised'))

const expect = chai.expect
const request = chai.request

afterEach(() => {
  sinon.restore()
})

module.exports = {
  expect,
  request,
  sinon,
  knex,
}
