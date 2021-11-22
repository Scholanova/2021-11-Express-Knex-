const { expect, sinon, request, knex } = require('./test-helper')
const app = require('../lib/app')

beforeEach(() => {
})

// Verification que tout est fonctionnel
describe('un test qui est vert', () => {
  let response

  beforeEach(async () => {
    response = await request(app).get('/status')
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient status = ok', () => {
    const expectedResponseBody = { status: 'ok' }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

describe('appel GET /users', () => {
  let response
  let john

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    response = await request(app).get('/users')
  })

  afterEach(async () => {
    await knex('users').where({ id: john.id }).del()
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient le nombre généré', () => {
    const expectedResponseBody = { users: [ john ] }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})
