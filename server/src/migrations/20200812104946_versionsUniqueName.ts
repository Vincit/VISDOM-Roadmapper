import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.table('versions', (table) => {
    table.unique(['roadmapId', 'name']);
  });
}

export async function down(knex: Knex): Promise<any> {}
