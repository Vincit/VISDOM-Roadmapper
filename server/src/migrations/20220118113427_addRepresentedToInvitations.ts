import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('invitationRepresentative', (table) => {
    table
      .uuid('invitationId')
      .references('id')
      .inTable('invitations')
      .onDelete('CASCADE');
    table
      .integer('customerId')
      .references('id')
      .inTable('customer')
      .onDelete('CASCADE');
    table.primary(['invitationId', 'customerId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('customerRepresentative');
}
