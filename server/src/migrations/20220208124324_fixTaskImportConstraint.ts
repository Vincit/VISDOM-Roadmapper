import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('tasks', (table) => {
    table.dropUnique(['externalId', 'importedFrom']);
    table.unique(['roadmapId', 'externalId', 'importedFrom']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Do nothing, the previous constraint was incorrect,
  // and as it was also stricter this might cause conflicts.
}
