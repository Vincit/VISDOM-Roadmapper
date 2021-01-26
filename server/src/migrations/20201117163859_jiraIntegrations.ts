import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return knex.schema
    .createTable('jiraconfigurations', (table) => {
      table.increments('id').primary();
      table.string('url', 250).notNullable();
      table.string('privatekey', 2048).notNullable();

      table
        .integer('roadmapId')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roadmaps')
        .onDelete('CASCADE')
        .index();

      table.unique(['roadmapId']);
    })
    .createTable('tokens', (table) => {
      table.increments('id').primary();
      table.string('provider', 75).notNullable();
      table.string('instance', 75).notNullable();
      table.string('type', 75).notNullable();
      table.string('value', 250).notNullable();

      table
        .integer('user')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index();

      table.unique(['user', 'type', 'provider', 'instance']);
    })
}


export async function down(knex: Knex): Promise<any> {
  return knex.schema
    .dropTableIfExists('jiraconfigurations')
    .dropTableIfExists('tokens');
}

