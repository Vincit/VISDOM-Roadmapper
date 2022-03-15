import { TaskStatus } from './../../../shared/types/customTypes';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('integration', (table) => {
    table
      .integer('tokenId')
      .references('id')
      .inTable('integration')
      .onDelete('SET NULL')
      .index();

    table.string('trelloTableId').nullable();
  });

  await knex.schema.createTable('trelloColumnMappings', (table) => {
    table.increments('id').primary();
    table
      .integer('integrationId')
      .references('id')
      .inTable('integration')
      .onDelete('CASCADE')
      .index();

    table.string('fromColumn', 75).notNullable();
    table.integer('toStatus').notNullable();
    table.unique(['integrationId', 'fromColumn']);
  });

  await knex.schema.alterTable('tasks', (table) => {
    table.integer('status').notNullable().defaultTo(0);
  });

  await knex('tasks').where('completed', true).update({
    status: TaskStatus.COMPLETED,
  });

  await knex.schema.alterTable('tasks', (table) => {
    table.dropColumn('completed');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('integration', (table) => {
    table.dropColumn('tokenId');
  });
  await knex.schema.alterTable('tasks', (table) => {
    table.boolean('completed').defaultTo(false);
  });
  await knex('tasks').where('status', TaskStatus.COMPLETED).update({
    completed: true,
  });
  await knex.schema.alterTable('tasks', (table) => {
    table.dropColumn('status');
  });
  await knex.schema.dropTable('trelloColumnMappings');
}
