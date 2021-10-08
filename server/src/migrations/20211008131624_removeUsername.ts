import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('username');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('users', (table) => {
      table.string('username', 255).notNullable();
    })
    .raw('CREATE UNIQUE INDEX lower_username ON users(LOWER(username));');
}
