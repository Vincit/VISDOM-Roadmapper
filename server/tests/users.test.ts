import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import { loggedInAgent } from './setuptests';
import User from '../src/api/users/users.model';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import { getUser } from '../src/utils/testdataUtils';
chai.use(chaiHttp);

describe('Test /users/ api', function () {
  describe('DELETE /users/', function () {
    it('Should delete user', async function () {
      const userId = (await getUser('AdminPerson1')).id;
      const delResponse = await loggedInAgent
        .delete('/users/' + userId)
        .type('json')
        .send({ currentPassword: 'test' });
      expect(delResponse.status).to.equal(200);
      const res = await loggedInAgent.get('/users/whoami');
      expect(res.status).to.equal(401);
    });
    it('Should not delete user if it is not the current one', async function () {
      const userId = (await getUser('DeveloperPerson1')).id;
      const delResponse = await loggedInAgent
        .delete('/users/' + userId)
        .type('json')
        .send({ currentPassword: 'test' });
      expect(delResponse.status).to.equal(403);
    });
  });

  describe('PATCH /users/', function () {
    it('Should patch user', async function () {
      const userId = (await getUser('AdminPerson1')).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ email: 'patched@example.com', currentPassword: 'test' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(userId);

      const res2 = await loggedInAgent.get('/users/whoami');
      expect(res2.body.email).to.equal('patched@example.com');
      expect(res2.body.emailVerified).to.equal(false);
    });
    it('Should not patch user if it is not the current one', async function () {
      const userId = (await getUser('DeveloperPerson1')).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ email: 'patched@example.com', currentPassword: 'test' });
      expect(patchResponse.status).to.equal(403);
    });
    it('Should update defaultRoadmapId from null to existing roadmap id', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (await getUser('AdminPerson1')).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: firstRoadmapId, currentPassword: 'test' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(userId);

      const userAfter = await loggedInAgent.get('/users/whoami');
      expect(userAfter.body.defaultRoadmapId).to.equal(firstRoadmapId);
    });
    it('Should update defaultRoadmapId from existing roadmap id to another', async function () {
      const [firstRoadmapId, secondRoadmapId] = (
        await Roadmap.query().limit(2)
      ).map(({ id }) => id);

      const userId = (await getUser('AdminPerson1')).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: firstRoadmapId, currentPassword: 'test' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(userId);

      const userBefore = await loggedInAgent.get('/users/whoami');
      expect(userBefore.body.defaultRoadmapId).to.equal(firstRoadmapId);

      const patchResponse2 = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: secondRoadmapId, currentPassword: 'test' });

      expect(patchResponse2.status).to.equal(200);
      expect(patchResponse2.body.id).to.equal(userId);

      const userAfter = await loggedInAgent.get('/users/whoami');
      expect(userAfter.body.defaultRoadmapId).to.equal(secondRoadmapId);
    });
    it('Should set defaultRoadmapId to null', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (await getUser('AdminPerson1')).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: firstRoadmapId, currentPassword: 'test' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(userId);

      const userBefore = await loggedInAgent.get('/users/whoami');
      expect(userBefore.body.defaultRoadmapId).to.equal(firstRoadmapId);

      const patchToNullRes = await loggedInAgent
        .patch('/users/' + userId)
        .type('json')
        .send({ defaultRoadmapId: null, currentPassword: 'test' });

      expect(patchToNullRes.status).to.equal(200);
      expect(patchToNullRes.body.id).to.equal(userId);

      const userAfter = await loggedInAgent.get('/users/whoami');
      expect(userAfter.body.defaultRoadmapId).to.equal(null);
    });
  });

  describe('POST /users/register', function () {
    it('Should register user', async function () {
      const before = (await User.query()).length;
      const res = await loggedInAgent
        .post('/users/register')
        .type('json')
        .send({
          email: 'test@email.com',
          password: 'test',
        });
      expect(res.status).to.equal(200);
      const after = (await User.query()).length;
      assert(after === before + 1, 'Length must increase');
    });
    it('Should disallow registering with existing email case insensitively', async function () {
      const res = await loggedInAgent
        .post('/users/register')
        .type('json')
        .send({
          email: 'test@email.com',
          password: 'test',
        });
      expect(res.status).to.equal(200);
      const names = ['TEST', 'TeSt', 'tEsT'];
      for (const name of names) {
        const res = await loggedInAgent
          .post('/users/register')
          .type('json')
          .send({
            email: `${name}@email.com`,
            password: 'test',
          });
        expect(res.status).to.equal(400);
      }
    });
  });

  describe('POST /users/login', function () {
    describe('Login with correct credentials', function () {
      it('Should login using email', async function () {
        // We dont wanna be logged in before this test so logout manually
        await loggedInAgent.get('/users/logout');

        const res = await loggedInAgent
          .post('/users/login')
          .type('json')
          .send({ email: 'business.person1@test.com', password: 'test' });
        expect(res.status).to.equal(200);
        expect(res).to.have.cookie('koa.sess');
      });

      it('Should be case insensitive', async function () {
        const cases = [
          'business.person1@test.com',
          'BUSINESS.PERSON1@TEST.COM',
          'Business.person1@TEST.com',
        ];
        for (const value of cases) {
          // We dont wanna be logged in before this test so logout manually
          await loggedInAgent.get('/users/logout');

          const res = await loggedInAgent
            .post('/users/login')
            .type('json')
            .send({ email: value, password: 'test' });
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
        .send({ email: 'business.person1@test.com', password: 'wrongpass' });
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
