import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.table('versions', (table) => {
    table.integer('sortingRank').index().notNullable().unsigned();
  });
}

export async function down(knex: Knex): Promise<any> {}
