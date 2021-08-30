import { knex, server } from '../src/server';
import chaiHttp from 'chai-http';
import chai from 'chai';
chai.use(chaiHttp);

export const agentData = {
  username: 'AdminPerson1',
  password: 'test',
};

before(async () => {
  app = await server;
  await knex.migrate.latest();
});

beforeEach(async () => {
  await knex.seed.run();
  loggedInAgent = chai.request.agent(app);

  await loggedInAgent.post('/users/login').type('json').send(agentData);
});

afterEach(async () => {
  await loggedInAgent.get('/users/logout');
});

after(async () => {
  loggedInAgent?.close();
  await app.close();
  await knex.destroy();
});

export let app: any;
export let loggedInAgent: ChaiHttp.Agent;
