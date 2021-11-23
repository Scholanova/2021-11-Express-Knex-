const faker = require('faker')
const { expect, sinon, request, knex } = require('./test-helper')
const app = require('../lib/app')

afterEach(async () => {
  await knex('users').del()
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

// Verification que la  base de donnée est correctement configurée
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

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient le nombre généré', () => {
    const expectedResponseBody = { users: [ john ] }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 1
// Récupérer un utilisateur existant en base de données par Id
// Body de retour : { user: { name: userName, id: userId }}
describe('appel GET /users/:id user existant', () => {
  let response
  let john

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    response = await request(app).get(`/users/${john.id}`)
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient le user demandé', () => {
    const expectedResponseBody = { user: john }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 2
// Si l'utilisateur n'existe pas en base de donnée
// Alors retourner une 404
// Body de retour : { error: 'User not found' }
describe('appel GET /users/:id user non existant', () => {
  let response
  let randomId

  beforeEach(async () => {
    randomId = faker.datatype.uuid()
    response = await request(app).get(`/users/${randomId}`)
  })

  it('le status de réponse est 404', () => {
    expect(response).to.have.status(404)
  })

  it('le body de réponse contient une erreur', () => {
    const expectedResponseBody = { error: 'User not found' }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 3
// En passant un name on peut créer un utilisateur
// L'utilisateur est retourné après avoir été créé
// Body de requête : { name: userName }
// Body de retour : { user : { name: userName, id: idGénéréPasLaBaseDeDonnée }}
describe('appel POST /users avec des données valides', () => {
  let response
  let johnName

  beforeEach(async () => {
    johnName = 'John'
    response = await request(app)
      .post('/users')
      .send({ name: johnName })
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient le user nouvellement créé', () => {
    expect(response).to.be.json

    const john = response.body.user

    expect(john.id).to.be.a('string')
    expect(john.name).to.deep.equal(johnName)
  })
})

// Question 4
// En passant un name vide on ne devrait pas pouvoir créer un utilisateur
// Une erreur 422 est retournée
// Body de requête : { name: '' } (avec chaine de char vide)
// Body de retour : { error: 'User name cannot be empty' }
describe.skip('appel POST /users avec des données invalides', () => {
  let response

  beforeEach(async () => {
    response = await request(app)
      .post('/users')
      .send({ name: '' })
  })

  it('le status de réponse est 422', () => {
    expect(response).to.have.status(422)
  })

  it('le body de réponse contient une erreur', () => {
    const expectedResponseBody = { error: 'User name cannot be empty' }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 5
// Récupérer les chaussures d'un utilisateur existant en base de données
// Body de retour : { shoes: [{id: shoeId, model: modelName, brand: brandName}] }
describe.skip('appel GET /users/:userId/shoes pour user existant', () => {
  let response
  let john
  let johnShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    johnShoes = await knex('users').insert({
      model: 'Crocodile',
      brand: 'Bacoste',
    }, {
      model: 'Originals',
      brand: 'Rebokk',
    }).returning('*')

    response = await request(app).get(`/users/${john.id}/shoes`)
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient les chaussures demandées', () => {
    const expectedShoeData = johnShoes.map((shoe) => {
      return { id: shoe.id, model: shoe.model, brand: shoe.brand }
    })
    const expectedResponseBody = { shoes: expectedShoeData }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 6
// Récupérer les chaussures d'un utilisateur qui n'existe pas en base de données
// Alors retourner une 404
// Body de retour : { error: 'User not found' }
describe.skip('appel GET /users/:userId/shoes pour user inexistant', () => {
  let response
  let randomId

  beforeEach(async () => {
    randomId = faker.datatype.uuid()
    response = await request(app).get(`/users/${randomId}/shoes`)
  })

  it('le status de réponse est 404', () => {
    expect(response).to.have.status(404)
  })

  it('le body de réponse contient une erreur', () => {
    const expectedResponseBody = { error: 'User not found' }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})
