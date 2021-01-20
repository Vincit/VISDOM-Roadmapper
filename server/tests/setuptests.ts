import { knex, server } from '../src/server';
import chaiHttp from 'chai-http';
import chai from 'chai';
chai.use(chaiHttp);

before(async () => {
  app = await server;
  await knex.migrate.latest();
});

beforeEach(async () => {
  await knex.seed.run();
  loggedInAgent = await chai.request.agent(app);

  const res = await loggedInAgent
    .post('/users/login')
    .type('json')
    .send({ username: 'AdminPerson1', password: 'test' });
});

afterEach(async () => {
  await loggedInAgent.get('/users/logout');
});

after(async () => {
  loggedInAgent.close();
  await app.close();
  await knex.destroy();
});

export let app: any;
export let loggedInAgent: ChaiHttp.Agent;
