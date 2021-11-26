const faker = require('faker')
const { expect, sinon, request, knex } = require('./test-helper')
const app = require('../lib/app')

afterEach(async () => {
  await knex('shoes').del()
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
describe('appel POST /users avec des données invalides', () => {
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
describe('appel GET /users/:userId/shoes pour user existant', () => {
  let response
  let john
  let johnShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Crocodile',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Originals',
        brand: 'Rebokk',
        user_id: john.id,
      },
    ]).returning('*')

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
describe('appel GET /users/:userId/shoes pour user inexistant', () => {
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

// Question 7
// Pouvoir ajouter une nouvelle paire de chaussures à un utilisateur existant
// Body de requête : { model, brand }
// Body de retour : { shoe: { ... } }
describe('appel POST /users/:userId/shoes avec des données valides', () => {
  let response
  let john
  let newShoeBrand
  let newShoeModel

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    newShoeBrand = faker.company.companyName()
    newShoeModel = faker.commerce.productName()

    response = await request(app)
      .post(`/users/${john.id}/shoes`)
      .send({ brand: newShoeBrand, model: newShoeModel })
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient la pair de chaussures nouvellement créé', () => {
    expect(response).to.be.json

    const newShoe = response.body.shoe

    expect(newShoe.id).to.be.a('string')
    expect(newShoe.brand).to.deep.equal(newShoeBrand)
    expect(newShoe.model).to.deep.equal(newShoeModel)
  })
})

// Question 8
// Tenter ajouter une nouvelle paire de chaussures à un utilisateur qui n'existe pas
// Alors retourner une 404
// Body de retour : { error: 'User not found' }
describe('appel POST /users/:userId/shoes pour un utilisateur qui n’existe pas', () => {
  let response
  let randomId
  let newShoeBrand
  let newShoeModel

  beforeEach(async () => {
    randomId = faker.datatype.uuid()

    newShoeBrand = faker.company.companyName()
    newShoeModel = faker.commerce.productName()

    response = await request(app)
      .post(`/users/${randomId}/shoes`)
      .send({ brand: newShoeBrand, model: newShoeModel })
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

// Question 9
// Calculer la valeur de la collection de chaussure d'un utilisateur en appelant /users/:userId/collection-value
// Les chaussures qu'ils a valent toute 100 de base
// Body de retour : { value: 200 }
describe('appel GET /users/:userId/collection-value pour user existant', () => {
  let response
  let john
  let johnShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: john.id,
      }, {
        model: 'Sneakers',
        brand: 'Abidas',
        user_id: john.id,
      },
    ]).returning('*')

    response = await request(app).get(`/users/${john.id}/collection-value`)
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient les chaussures demandées', () => {
    const expectedResponseBody = { value: 200 }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 10
// Calculer la valeur de la collection de chaussure d'un utilisateur
// Les chaussures qu'ils a valent toute 100 de base,
// mais les Bacoste valent 150
// et les Bucci valent 250
// Body de retour : { value: 200 }
describe('appel GET /users/:userId/collection-value pour user existant pour de meilleurs chaussures', () => {
  let response
  let john
  let johnShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    const createdUsersV2 = await knex('users').insert({
      name: 'marc',
    }).returning('*')
    const marc = createdUsersV2[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: john.id,
      }, {
        model: 'Sneakers',
        brand: 'Abidas',
        user_id: john.id,
      }, {
        model: 'Crocodile',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: john.id,
      },
    ]).returning('*')

    const marcShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: marc.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: marc.id,
      },
    ]).returning('*')

    response = await request(app).get(`/users/${john.id}/collection-value`)
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient les chaussures demandées', () => {
    const expectedResponseBody = { value: 600 }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 11
// Supprimer un utilisateur existant
// DELETE /users/:id
// Cela supprime un utilisateur donné mais pas les autres utilisatuers
// Alors retourner une 204 sans body de retour
describe.skip('appel DELETE /users/:userId pour user existant', () => {
  let response
  let john
  let johnShoes
  let marc
  let marcShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    const createdUsersV2 = await knex('users').insert({
      name: 'marc',
    }).returning('*')
    marc = createdUsersV2[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: john.id,
      }, {
        model: 'Sneakers',
        brand: 'Abidas',
        user_id: john.id,
      }, {
        model: 'Crocodile',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: john.id,
      },
    ]).returning('*')

    marcShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: marc.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: marc.id,
      },
    ]).returning('*')

    response = await request(app).delete(`/users/${john.id}`)
  })

  it('le status de réponse est 204', () => {
    expect(response).to.have.status(204)
  })

  it('le body de réponse ne contient aucune donnée', () => {
    const expectedResponseBody = {}
    expect(response.body).to.deep.equal(expectedResponseBody)
  })

  it('marc et ses chaussures sont encore là', async () => {
    const { count: marcShoeCount } = await knex('shoes').count('id').where({ user_id: marc.id }).first()
    const marcAfterDelete = await knex('users').select('*').where({ id: marc.id }).first()
    expect(marcShoeCount).to.equal(`${marcShoes.length}`)
    expect(marcAfterDelete).to.deep.equal(marc)
  })

  it('john et ses chaussures ne sont par contre plus là', async () => {
    const { count: johnShoeCount } = await knex('shoes').count('id').where({ user_id: john.id }).first()
    const johnAfterDelete = await knex('users').select('*').where({ id: john.id }).first()
    expect(johnShoeCount).to.equal('0')
    expect(johnAfterDelete).to.equal(undefined)
  })
})

// Question 12
// Supprimer un utilisateur qui n'existe pas
// Alors retourner une 404
// Body de retour : { error: 'User not found' }
describe.skip('appel DELETE /users/:userId pour user non existant', () => {
  let response
  let john
  let johnShoes
  let randomId


  beforeEach(async () => {
    randomId = faker.datatype.uuid()

    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: john.id,
      }, {
        model: 'Sneakers',
        brand: 'Abidas',
        user_id: john.id,
      }, {
        model: 'Crocodile',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: john.id,
      },
    ]).returning('*')

    response = await request(app).delete(`/users/${randomId}`)
  })

  it('le status de réponse est 404', () => {
    expect(response).to.have.status(404)
  })

  it('le body de réponse contient une erreur', () => {
    const expectedResponseBody = { error: 'User not found' }
    expect(response).to.be.json
    expect(response.body).to.deep.equal(expectedResponseBody)
  })

  it('john et ses chaussures sont encore là', async () => {
    const { count: johnShoeCount } = await knex('shoes').count('id').where({ user_id: john.id }).first()
    const johnAfterDelete = await knex('users').select('*').where({ id: john.id }).first()
    expect(johnShoeCount).to.equal(`${johnShoes.length}`)
    expect(johnAfterDelete).to.deep.equal(john)
  })
})

// Question 13
// Lister toutes les différentes marques de chaussures des différents utilisateur
// ⚠️ ⚠️ ⚠️ Les marques seront ordonnées par ordre alphabétique ️⚠️ ⚠️ ⚠️
// GET /brands
// Body de retour : { brands: ['Baccoste', 'Rebokk'] }
describe.skip('appel GET /brands', () => {
  let response
  let john
  let johnShoes
  let marc
  let marcShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    const createdUsersV2 = await knex('users').insert({
      name: 'marc',
    }).returning('*')
    marc = createdUsersV2[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: john.id,
      }, {
        model: 'Sneakers',
        brand: 'Abidas',
        user_id: john.id,
      }, {
        model: 'Crocodile',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: john.id,
      },
    ]).returning('*')

    marcShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: marc.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: marc.id,
      },
    ]).returning('*')

    response = await request(app).get('/brands')
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient la liste des chaussures en ordre alphabétique', () => {
    const expectedResponseBody = { brands: [ 'Abidas', 'Bacoste', 'Bans', 'Bucci' ] }
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 14
// Lister toutes les différentes modèles de chaussures
// ⚠️ ⚠️ ⚠️ Les modèles seront ordonnées par ordre alphabétique ️⚠️ ⚠️ ⚠️
// GET /models
// Status de retour : 200
// Body de retour : { models: ['Regular'] }
describe.skip('appel GET /models', () => {
  let response
  let john
  let johnShoes
  let marc
  let marcShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    const createdUsersV2 = await knex('users').insert({
      name: 'marc',
    }).returning('*')
    marc = createdUsersV2[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: john.id,
      }, {
        model: 'Sneakers',
        brand: 'Abidas',
        user_id: john.id,
      }, {
        model: 'Crocodile',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: john.id,
      },
    ]).returning('*')

    marcShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: marc.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: marc.id,
      },
    ]).returning('*')

    response = await request(app).get('/models')
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient la liste des modèles en ordre alphabétique', () => {
    const expectedResponseBody = { models: [ 'Cherros', 'Crocodile', 'Sneakers', 'Vintage' ] }
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})

// Question 15
// Lister toutes les différentes modèles de chaussures pour une marque donnée existante en base
// Cela renvoi une liste avec les modèles en question
// ⚠️ ⚠️ ⚠️ Les modèles seront ordonnées par ordre alphabétique ️⚠️ ⚠️ ⚠️
// GET /models?brand=Bacoste
// Status de retour : 200
// Body de retour : { models: ['Regular'] }
describe.skip('appel GET /models?brand=:brandName', () => {
  let response
  let john
  let johnShoes
  let marc
  let marcShoes

  beforeEach(async () => {
    const createdUsers = await knex('users').insert({
      name: 'john',
    }).returning('*')
    john = createdUsers[0]

    const createdUsersV2 = await knex('users').insert({
      name: 'marc',
    }).returning('*')
    marc = createdUsersV2[0]

    johnShoes = await knex('shoes').insert([
      {
        model: 'Blanchasse',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Sneakers',
        brand: 'Abidas',
        user_id: john.id,
      }, {
        model: 'Crocodile',
        brand: 'Bacoste',
        user_id: john.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: john.id,
      },
    ]).returning('*')

    marcShoes = await knex('shoes').insert([
      {
        model: 'Vintage',
        brand: 'Bans',
        user_id: marc.id,
      }, {
        model: 'Cherros',
        brand: 'Bucci',
        user_id: marc.id,
      },
    ]).returning('*')

    response = await request(app).get('/models?brand=Bacoste')
  })

  it('le status de réponse est 200', () => {
    expect(response).to.have.status(200)
  })

  it('le body de réponse contient la liste des modèles en ordre alphabétique', () => {
    const expectedResponseBody = { models: [ 'Blanchasse', 'Crocodile' ] }
    expect(response.body).to.deep.equal(expectedResponseBody)
  })
})
