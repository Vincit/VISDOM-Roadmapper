import { knex, server } from '../src/server';

before(async () => {
  app = await server;
  await knex.migrate.latest();
});

beforeEach(async () => {
  await knex.seed.run();
});

after(async () => {
  await app.close();
  await knex.destroy();
});

export let app: any;
