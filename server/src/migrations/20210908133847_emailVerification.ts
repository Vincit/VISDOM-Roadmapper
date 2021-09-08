import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('emailVerification', (table) => {
      table
        .integer('userId')
        .primary()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.uuid('uuid').unique().index();
      table.string('email', 255);
      table.timestamp('updatedAt');
    })
    .alterTable('users', (table) => {
      table.boolean('emailVerified').notNullable().defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('emailVerification')
    .alterTable('users', (table) => {
      table.dropColumn('emailVerified');
    });
}
