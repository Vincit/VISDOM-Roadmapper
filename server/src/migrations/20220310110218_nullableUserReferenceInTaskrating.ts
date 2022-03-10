import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('taskratings', (table) => {
      table.dropForeign(['createdByUser']);
      table.dropIndex(['createdByUser']);
      table
        .integer('createdByUser')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()
        .alter();
    })
    .raw(
      // The unique constraint is ingored on rows where any of
      // the columns in the constraint are null. This allows setting
      // deleted user references to NULL, but requires additional
      // constraint on developer ratings, as "forCustomer" is always
      // NULL for those.
      `
      CREATE UNIQUE INDEX unique_developer_ratings
      ON taskratings("parentTask", "createdByUser", dimension)
      WHERE "forCustomer" IS NULL;
      `,
    );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('taskratings', (table) => {
    table.dropForeign(['createdByUser']);
    table.dropIndex(['createdByUser']);
    table.dropIndex('', 'unique_developer_ratings');
    table
      .integer('createdByUser')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index()
      .alter();
  });
}
