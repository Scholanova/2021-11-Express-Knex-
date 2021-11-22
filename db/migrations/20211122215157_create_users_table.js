function installExtensions(knex) {

}

exports.up = knex => {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .then(() => {
      return knex.schema.createTable('users', table => {
        table
          .uuid('id')
          .defaultTo(knex.raw('uuid_generate_v4()'))
          .notNullable()
          .primary()
        table.string('name')
      })
    })
}

exports.down = knex => {
  return knex.schema.dropTable('users')
}
