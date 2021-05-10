import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import { loggedInAgent } from './setuptests';
import User from '../src/api/users/users.model';
chai.use(chaiHttp);
describe('Test /users/ api', function () {
  describe('GET /users/', function () {
    it('Should return all users names, types', async function () {
      const res = await loggedInAgent.get('/users/');
      expect(res.status).to.equal(200);
      assert(res.body.length > 1);
      assert.property(res.body[0], 'username');
      assert.property(res.body[0], 'type');
      assert(res.body[0].username.length > 0);
    });
  });

  describe('POST /users/', function () {
    it('Should add new user', async function () {
      const testUser = {
        username: 'Testuser',
        email: 'testuser@testuser.com',
        type: 0,
        password: 'test',
      };
      const res = await loggedInAgent.get('/users/');
      const lenBefore = res.body.length;
      const postResponse = await loggedInAgent
        .post('/users')
        .type('json')
        .send(testUser);
      expect(postResponse.status).to.equal(200);
      const res2 = await loggedInAgent.get('/users/');
      const lenAfter = res2.body.length;
      const insertedUser = res2.body.find((user: any) => {
        return user.username == testUser.username;
      });
      assert(lenAfter === lenBefore + 1, 'Length must increase');
      expect(insertedUser).to.exist;
    });
  });

  describe('DELETE /users/', function () {
    it('Should delete user', async function () {
      const firstUserId = (await User.query().first()).id;
      const res = await loggedInAgent.get('/users/');
      const lenBefore = res.body.length;
      const delResponse = await loggedInAgent.delete('/users/' + firstUserId);
      expect(delResponse.status).to.equal(200);

      const res2 = await loggedInAgent.get('/users/');
      const lenAfter = res2.body.length;
      assert(lenAfter === lenBefore - 1, 'Length must decrease');
    });
  });

  describe('PATCH /users/', function () {
    it('Should patch user', async function () {
      const firstUserId = (await User.query().first()).id;
      const patchResponse = await loggedInAgent
        .patch('/users/' + firstUserId)
        .type('json')
        .send({ username: 'patched' });

      expect(patchResponse.status).to.equal(200);
      expect(patchResponse.body.id).to.equal(firstUserId);

      const res2 = await loggedInAgent.get('/users/');
      const patchedUser = res2.body.find((user: any) => {
        return user.username == 'patched';
      });
      expect(patchedUser).to.exist;
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
});
