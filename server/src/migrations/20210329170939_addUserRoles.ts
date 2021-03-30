import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('roles', (table) => {
    table
      .integer('userId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();
    table
      .integer('roadmapId')
      .references('id')
      .inTable('roadmaps')
      .onDelete('CASCADE');
    table.integer('type');
    table.primary(['userId', 'roadmapId']);
  });
}

export async function down(knex: Knex): Promise<any> {
  knex.schema.dropTableIfExists('roles');
}
