import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('integration', (table) => {
    table.dropColumn('tokenId');
  });
  await knex.schema.alterTable('tokens', (table) => {
    table
      .integer('forIntegration')
      .references('id')
      .inTable('integration')
      .onDelete('CASCADE')
      .index();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tokens', (table) => {
    table.dropColumn('forIntegration');
  });
  await knex.schema.alterTable('integration', (table) => {
    table
      .integer('tokenId')
      .references('id')
      .inTable('integration')
      .onDelete('SET NULL')
      .index();
  });
}
