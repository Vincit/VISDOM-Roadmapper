import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema
    .createTable('customer', (table) => {
      table.increments('id').primary();
      table
        .integer('roadmapId')
        .references('id')
        .inTable('roadmaps')
        .onDelete('CASCADE');
      table.string('name', 75).notNullable();
      table.string('email', 255).nullable();
      table.string('color', 7).nullable();
      table.integer('value').unsigned().defaultTo(0);
    })
    .createTable('customerRepresentative', (table) => {
      table
        .integer('userId')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .integer('customerId')
        .references('id')
        .inTable('customer')
        .onDelete('CASCADE');
      table.primary(['userId', 'customerId']);
    })
    .alterTable('users', (table) => {
      table.dropColumn('customerValue');
    })
    .alterTable('taskratings', (table) => {
      table
        .integer('forCustomer')
        .references('id')
        .inTable('customer')
        .nullable();
    });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema
    .alterTable('taskratings', (table) => {
      table.dropColumn('forCustomer');
    })
    .alterTable('users', (table) => {
      table.integer('customerValue').unsigned();
    })
    .dropTableIfExists('customerRepresentative')
    .dropTableIfExists('customer');
}
