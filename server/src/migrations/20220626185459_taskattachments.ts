import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('taskattachments', (table) => {
    table.increments('id').primary();
    table
      .integer('parentTask')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
      .index();
    table.string('link');
  });
}

export async function down(knex: Knex): Promise<any> {
  knex.schema.dropTableIfExists('taskattachments');
}
