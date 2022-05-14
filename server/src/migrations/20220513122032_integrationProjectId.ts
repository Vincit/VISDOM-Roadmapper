import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('integration', (table) => {
    table.string('projectId', 255);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('integration', (table) => {
    table.dropColumn('projectId');
  });
}
