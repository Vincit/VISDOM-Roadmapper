import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('integration', (table) => {
    table
      .integer('tokenId')
      .references('id')
      .inTable('integration')
      .onDelete('SET NULL')
      .index();
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
    table.enu('toStatus', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
      useNative: true,
      existingType: false,
      enumName: 'task_status_type',
    });
    table.unique(['integrationId', 'fromColumn']);
  });

  await knex.schema.alterTable('tasks', (table) => {
    table
      .enu('status', [], {
        useNative: true,
        existingType: true,
        enumName: 'task_status_type',
      })
      .defaultTo('NOT_STARTED');
  });

  await knex('tasks').where('completed', true).update({
    status: 'COMPLETED',
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
  await knex('tasks').where('status', 'COMPLETED').update({
    completed: true,
  });
  await knex.schema.alterTable('tasks', (table) => {
    table.dropColumn('status');
  });
  await knex.schema.dropTable('trelloColumnMappings');
}
