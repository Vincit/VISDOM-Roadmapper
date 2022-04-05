import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('integration', (table) => {
    table.renameColumn('trelloTableId', 'boardId');
  });
  await knex.schema.renameTable('trelloColumnMappings', 'importStatusMapping');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('integration', (table) => {
    table.renameColumn('boardId', 'trelloTableId');
  });
  await knex.schema.renameTable('importStatusMapping', 'trelloColumnMappings');
}
