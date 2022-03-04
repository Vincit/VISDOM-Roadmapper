import { Knex } from 'knex';

// TODO: migrate existing configurations to and from the new table

export async function up(knex: Knex): Promise<any> {
  return knex.schema
    .createTable('integration', (table) => {
      table.increments('id').primary();
      table.string('name', 250).notNullable();
      table.string('host', 250).notNullable();
      table.string('consumerkey', 250).notNullable();
      table.string('privatekey', 2048).notNullable();
      table
        .integer('roadmapId')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roadmaps')
        .onDelete('CASCADE')
        .index();

      table.unique(['name', 'roadmapId']);
    })
    .dropTableIfExists('jiraconfiguration');
}

export async function down(knex: Knex): Promise<any> {
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
    .dropTableIfExists('integration');
}
