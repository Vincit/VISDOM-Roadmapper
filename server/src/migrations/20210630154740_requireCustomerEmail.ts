import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('customer', (table) => {
    table.string('email', 255).notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('customer', (table) => {
    table.string('email', 255).nullable().alter();
  });
}
