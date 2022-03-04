import { Knex } from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema.alterTable('users', (table) => {
    table.dropUnique(['username']);
    table.dropUnique(['email']);
  }).raw(`
    CREATE UNIQUE INDEX lower_username ON users(LOWER(username));
    CREATE UNIQUE INDEX lower_email ON users(LOWER(email));
  `);
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.alterTable('users', (table) => {
    table.dropIndex([], 'lower_username');
    table.dropIndex([], 'lower_email');
    table.unique(['username']);
    table.unique(['email']);
  });
}
