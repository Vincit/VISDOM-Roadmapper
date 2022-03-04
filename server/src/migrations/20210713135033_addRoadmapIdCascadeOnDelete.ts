import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('versions', (table) => {
    table.dropForeign(['roadmapId']);
    table.dropIndex('roadmapId');
    table
      .integer('roadmapId')
      .references('id')
      .inTable('roadmaps')
      .onDelete('CASCADE')
      .index()
      .alter();
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('versions', (table) => {
    table.dropForeign(['roadmapId']);
    table.dropIndex('roadmapId');
    table
      .integer('roadmapId')
      .references('id')
      .inTable('roadmaps')
      .index()
      .alter();
  });
}
