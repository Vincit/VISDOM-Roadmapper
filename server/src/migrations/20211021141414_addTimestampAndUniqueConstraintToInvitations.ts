import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('invitations', (table) => {
    table.timestamp('updatedAt');
    table.unique(['roadmapId', 'email']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('invitations', (table) => {
    table.dropColumn('updatedAt');
    table.dropUnique(['roadmapId', 'email']);
  });
}
