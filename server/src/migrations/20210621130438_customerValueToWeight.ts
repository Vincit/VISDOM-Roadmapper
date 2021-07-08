import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('customer', (table) => {
    table.dropColumn('value');
    table.integer('weight').notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('customer', (table) => {
    table.dropColumn('weight');
    table.integer('value').unsigned().defaultTo(0);
  });
}
