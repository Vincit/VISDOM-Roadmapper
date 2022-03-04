import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema
    .alterTable('versions', (table) => {
      table.dropColumn('tasks');
    })
    .createTable('versionTasks', (table) => {
      table
        .integer('versionId')
        .references('id')
        .inTable('versions')
        .onDelete('CASCADE')
        .index();
      table
        .integer('taskId')
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')
        .index();
      table.integer('order');
      table.primary(['versionId', 'taskId']);
    });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema
    .dropTableIfExists('versionTasks')
    .alterTable('versions', (table) => {
      table.text('tasks');
    });
}
