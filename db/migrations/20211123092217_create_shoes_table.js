exports.up = function (knex) {
  return knex.schema.createTable('shoes', table => {
    table
      .uuid('id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .notNullable()
      .primary()
    table.string('brand')
    table.string('model')
    table
      .foreign('user_ui')
      .references('users.id')
      .onDelete('CASCADE')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('shoes')
}
