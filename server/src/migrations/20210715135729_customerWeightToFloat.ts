import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('customer', (table) => {
    table.float('weight').notNullable().defaultTo(1).alter();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('customer', (table) => {
    table.integer('weight').notNullable().defaultTo(0).alter();
  });
}
