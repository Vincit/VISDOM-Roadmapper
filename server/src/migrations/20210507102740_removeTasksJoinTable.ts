import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.dropTableIfExists('taskjointable');
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.createTable('taskjointable', (table) => {
    table.increments('id').primary();
    table
      .integer('taskId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
      .index();
    table
      .integer('taskIdRelated')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
      .index();
    table.unique(['taskId', 'taskIdRelated']);
  });
}
