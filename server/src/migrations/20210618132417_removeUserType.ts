import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.table('users', (table) => {
    table.dropColumn('type');
  });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.table('users', (table) => {
    table.integer('type').notNullable().unsigned();
  });
}
