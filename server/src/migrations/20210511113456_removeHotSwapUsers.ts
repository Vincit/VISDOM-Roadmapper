import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  knex.schema.dropTableIfExists('hotSwappableUsers');
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.createTable('hotSwappableUsers', (table) => {
    table.increments('id').primary();
    table
      .integer('fromUserId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();
    table
      .integer('toUserId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.unique(['fromUserId', 'toUserId']);
  });
}
