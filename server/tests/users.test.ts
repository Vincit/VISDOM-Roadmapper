import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import { loggedInAgent } from './setuptests';
import User from '../src/api/users/users.model';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
chai.use(chaiHttp);

describe('Test /users/ api', function () {
  describe('GET /users/', function () {
    it('Access of the route should be temporarily forbidden', async function () {
      const res = await loggedInAgent.get('/users/');
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /users/', function () {
    it('Access of the route should be temporarily forbidden', async function () {
      const testUser = {
        username: 'Testuser',
        email: 'testuser@testuser.com',
        type: 0,
        password: 'test',
      };
      const postResponse = await loggedInAgent
        .post('/users')
        .type('json')
        .send(testUser);
      expect(postResponse.status).to.equal(403);
    });
  });

  describe('DELETE /users/', function () {
    it('Should delete user', async function () {
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      const delResponse = await loggedInAgent.delete('/users/' + userId);
      expect(delResponse.status).to.equal(200);
      const res = await loggedInAgent.get('/users/whoami');
      expect(res.status).to.equal(401);
    });
    it('Should not delete user if it is not the current one', async function () {
      const userId = (
        await User.query().where({ username: 'DeveloperPerson1' }).first()
      ).id;
      const delResponse = await loggedInAgent.delete('/users/' + userId);
      expect(delResponse.status).to.equal(403);
    });
  });

  describe('PATCH /users/', function () {
    it('Should patch user', async function () {
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ username: 'patched' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(userId);

      const res2 = await loggedInAgent.get('/users/whoami');
      expect(res2.body.username).to.equal('patched');
    });
    it('Should not patch user if it is not the current one', async function () {
      const userId = (
        await User.query().where({ username: 'DeveloperPerson1' }).first()
      ).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ username: 'patched' });
      expect(patchResponse.status).to.equal(403);
    });
    it.only('Should update defaultRoadmapId to existing roadmap id', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: firstRoadmapId });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(userId);

      const res2 = await loggedInAgent.get('/users/whoami');
      expect(res2.body.defaultRoadmapId).to.equal(firstRoadmapId);
    });
    it.only('Should set defaultRoadmapId to null', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: firstRoadmapId });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(userId);

      const whoamiRes = await loggedInAgent.get('/users/whoami');
      expect(whoamiRes.body.defaultRoadmapId).to.equal(firstRoadmapId);

      const patchToNullRes = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: null });

      expect(patchToNullRes.status).to.equal(200);
      expect(patchToNullRes.body.id).to.equal(userId);

      const whoamiRes2 = await loggedInAgent.get('/users/whoami');
      expect(whoamiRes2.body.defaultRoadmapId).to.equal(null);
    });
  });

  describe('POST /users/register', function () {
    it('Should register user', async function () {
      const before = (await User.query()).length;
      const res = await loggedInAgent
        .post('/users/register')
        .type('json')
        .send({
          username: 'test',
          email: 'test@email.com',
          password: 'test',
        });
      expect(res.status).to.equal(200);
      const after = (await User.query()).length;
      assert(after === before + 1, 'Length must increase');
    });
    it('Should disallow @ in username', async function () {
      const before = (await User.query()).length;
      const res = await loggedInAgent
        .post('/users/register')
        .type('json')
        .send({
          username: 'test@name',
          email: 'test@email.com',
          password: 'test',
        });
      expect(res.status).to.equal(400);
      const after = (await User.query()).length;
      assert(after === before, 'Length must not change');
    });
    it('Should disallow registering with existing username case insensitively', async function () {
      const names = ['test', 'TEST', 'TeSt', 'tEsT'];
      const res = await loggedInAgent
        .post('/users/register')
        .type('json')
        .send({
          username: names[0],
          email: 'test@email.com',
          password: 'test',
        });
      expect(res.status).to.equal(200);
      for (const name of names) {
        const res = await loggedInAgent
          .post('/users/register')
          .type('json')
          .send({
            username: name,
            email: 'another@email.com',
            password: 'test',
          });
        expect(res.status).to.equal(400);
      }
    });
  });

  describe('POST /users/login', function () {
    describe('Login with correct credentials', function () {
      [
        { type: 'username', value: 'BusinessPerson1' },
        { type: 'email', value: 'biz@business.com' },
      ].forEach(({ type, value }) => {
        it(`Should login using ${type}`, async function () {
          // We dont wanna be logged in before this test so logout manually
          await loggedInAgent.get('/users/logout');

          const res = await loggedInAgent
            .post('/users/login')
            .type('json')
            .send({ username: value, password: 'test' });
          expect(res.status).to.equal(200);
          expect(res).to.have.cookie('koa.sess');
        });
      });

      it('Should be case insensitive', async function () {
        const cases = [
          'BusinessPerson1',
          'bUSINESSpERSON1',
          'businessperson1',
          'BUSINESSPERSON1',
        ];
        for (const value of cases) {
          // We dont wanna be logged in before this test so logout manually
          await loggedInAgent.get('/users/logout');

          const res = await loggedInAgent
            .post('/users/login')
            .type('json')
            .send({ username: value, password: 'test' });
          expect(res.status).to.equal(200);
          expect(res).to.have.cookie('koa.sess');
        }
      });
    });

    it('Should fail login user with wrong credentials', async function () {
      // We dont wanna be logged in before this test so logout manually
      await loggedInAgent.get('/users/logout');

      const res = await loggedInAgent
        .post('/users/login')
        .type('json')
        .send({ username: 'BusinessPerson1', password: 'wrongpass' });
      expect(res.status).to.equal(401);
    });
  });

  describe('GET /users/logout', function () {
    it('Should logout when logged in', async function () {
      const res = await loggedInAgent.get('/users/logout');
      expect(res.status).to.equal(200);
    });

    it('Should fail logout when not logged in', async function () {
      // We dont wanna be logged in before this test so logout manually
      await loggedInAgent.get('/users/logout');

      const res = await loggedInAgent.get('/users/logout');
      expect(res.status).to.equal(401);
    });
  });

  describe('GET /users/whoami', function () {
    it('Should respond with user info', async function () {
      const res2 = await loggedInAgent.get('/users/whoami');
      expect(res2.status).to.equal(200);
      expect(res2.body).to.have.property('id');
      expect(res2.body).to.have.property('username');
      expect(res2.body).to.have.property('email');
      expect(res2.body).to.have.property('roles');
    });
  });

  describe('GET /users/roles', function () {
    it('Should respond with user role info', async function () {
      const res2 = await loggedInAgent.get('/users/roles');
      expect(res2.status).to.equal(200);
      expect(res2.body[0]).to.have.property('type');
    });
  });
});
