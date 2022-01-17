import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('passwordResetToken', (table) => {
    table
      .integer('userId')
      .primary()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.uuid('uuid').unique().index();
    table.timestamp('updatedAt');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('passwordResetToken');
}
