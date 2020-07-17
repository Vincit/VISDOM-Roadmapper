import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username', 75);
      table.string('email', 75);
      table.string('password', 75);
      table.integer('type').notNullable().unsigned();
      table.integer('customerValue').unsigned();

      table.unique(['username']);
      table.unique(['email']);
    })
    .createTable('roadmaps', (table) => {
      table.increments('id').primary();
      table.string('name', 250);
      table.text('description');
    })
    .createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('name', 250);
      table.text('description');
      table.boolean('completed').defaultTo(false);
      table.timestamp('createdAt');

      table
        .integer('roadmapId')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roadmaps')
        .onDelete('CASCADE')
        .index();

      table
        .integer('createdByUser')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .index();
    })
    .createTable('taskratings', (table) => {
      table.increments('id').primary();
      table.integer('dimension');
      table.float('value').unsigned();
      table.text('comment').defaultTo('');

      table
        .integer('parentTask')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')
        .index();
      table
        .integer('createdByUser')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index();

      table.unique(['parentTask', 'createdByUser', 'dimension']);
    })
    .createTable('taskjointable', (table) => {
      table.increments('id').primary();
      table
        .integer('taskId')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')
        .index();
      table
        .integer('taskIdRelated')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')
        .index();
      table.unique(['taskId', 'taskIdRelated']);
    })
    .createTable('versions', (table) => {
      table.increments('id').primary();
      table.integer('roadmapId').references('id').inTable('roadmaps').index();
      table.string('name', 75);
      table.text('tasks');
      table.unique(['roadmapId', 'id']);
    });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema
    .dropTableIfExists('versions')
    .dropTableIfExists('taskjointable')
    .dropTableIfExists('taskratings')
    .dropTableIfExists('tasks')
    .dropTableIfExists('roadmaps')
    .dropTableIfExists('users');
}
