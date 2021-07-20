import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('taskratings', (table) => {
    table.dropForeign(['forCustomer']);
    table
      .integer('forCustomer')
      .references('id')
      .inTable('customer')
      .onDelete('CASCADE')
      .alter();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('taskratings', (table) => {
    table.dropForeign(['forCustomer']);
    table
      .integer('forCustomer')
      .references('id')
      .inTable('customer')
      .alter();
  });
}

