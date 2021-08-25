import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('invitations', (table) => {
    table.uuid('id').primary().index();
    table
      .integer('roadmapId')
      .references('id')
      .inTable('roadmaps')
      .onDelete('CASCADE');
    table.integer('type');
    table.string('email', 255);
  });
}

export async function down(knex: Knex): Promise<any> {
  knex.schema.dropTableIfExists('invitations');
}
