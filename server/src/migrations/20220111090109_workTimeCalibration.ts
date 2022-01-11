import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('roadmaps', (table) => {
    table.float('daysPerWorkCalibration').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('roadmaps', (table) => {
    table.dropColumn('daysPerWorkCalibration');
  });
}
