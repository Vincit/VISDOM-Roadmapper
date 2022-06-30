import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('taskattachments', (table) => {
    table.increments('id').primary();
    table
      .integer('task')
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
      .index();
    table.string('attachment');
  });
}

export async function down(knex: Knex): Promise<any> {
  knex.schema.dropTableIfExists('taskattachments');
}
