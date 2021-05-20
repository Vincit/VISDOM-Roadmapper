import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import { loggedInAgent } from './setuptests';
import User from '../src/api/users/users.model';
import { UserType } from '../src/types/customTypes';
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
          type: UserType.AdminUser,
        });
      expect(res.status).to.equal(200);
      const after = (await User.query()).length;
      assert(after === before + 1, 'Length must increase');
    });
  });

  describe('POST /users/login', function () {
    it('Should login user with correct credentials', async function () {
      // We dont wanna be logged in before this test so logout manually
      await loggedInAgent.get('/users/logout');

      const res = await loggedInAgent
        .post('/users/login')
        .type('json')
        .send({ username: 'BusinessPerson1', password: 'test' });
      expect(res.status).to.equal(200);
      expect(res).to.have.cookie('koa.sess');
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
      expect(res2.body).to.have.property('type');
      expect(res2.body).to.have.property('email');
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
