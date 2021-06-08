import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('tasks', (table) => {
    table.dropColumn('jiraId');

    table.string('externalId').index().nullable();
    table.string('importedFrom').nullable();
    table.string('externalLink').nullable();
    table.unique(['externalId', 'importedFrom']);
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('tasks', (table) => {
    table.dropColumn('externalId');
    table.dropColumn('importedFrom');
    table.dropColumn('externalLink');

    table.integer('jiraId').index().nullable();
  });
}
