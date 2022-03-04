import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('taskratings', (table) => {
    table.dropUnique(['parentTask', 'createdByUser', 'dimension']);
    table.unique(['parentTask', 'createdByUser', 'forCustomer', 'dimension']);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('taskratings', (table) => {
    table.dropUnique([
      'parentTask',
      'createdByUser',
      'forCustomer',
      'dimension',
    ]);
    table.unique(['parentTask', 'createdByUser', 'dimension']);
  });
}
