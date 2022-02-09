import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('taskratings').update({
    value: knex.raw('floor((taskratings.value - 1) / 2) + 1'),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('taskratings').update({
    value: knex.raw('taskratings.value * 2'),
  });
}
