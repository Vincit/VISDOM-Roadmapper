import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.table('tasks', (table) => {
    table.integer('jiraId').index().nullable();
  });
}

export async function down(knex: Knex): Promise<any> {}
