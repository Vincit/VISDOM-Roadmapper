import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema
    .alterTable('users', (table) => {
      table.string('username', 255).alter();
      table.string('email', 255).alter();
    })
    .alterTable('roadmaps', (table) => {
      table.string('name', 255).alter();
    })
    .alterTable('tasks', (table) => {
      table.string('name', 255).alter();
    })
    .alterTable('customer', (table) => {
      table.string('name', 255).notNullable().alter();
    });
}

export async function down(knex: Knex): Promise<any> {}
