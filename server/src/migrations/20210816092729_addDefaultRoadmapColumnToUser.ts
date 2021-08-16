import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('users', (table) => {
    table
      .integer('defaultRoadmapId')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('roadmaps')
      .onDelete('SET NULL')
      .index();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('users', (table) => {
    table.dropForeign(['defaultRoadmapId']);
    table.dropColumn('defaultRoadmapId');
  });
}
