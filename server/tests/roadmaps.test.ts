import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import { loggedInAgent } from './setuptests';
chai.use(chaiHttp);

describe('Test /roadmaps/ api', function () {
  describe('GET /roadmaps/', function () {
    it('Should return all roadmaps', async function () {
      const res = await loggedInAgent.get('/roadmaps/');
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('id');
      expect(res.body[0]).to.have.property('name');
      expect(res.body[0]).to.have.property('description');
      expect(res.body[0]).to.have.property('tasks');
    });

    it('Should return all roadmaps, eager loaded', async function () {
      const res = await loggedInAgent.get('/roadmaps?eager=1');
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('id');
      expect(res.body[0]).to.have.property('name');
      expect(res.body[0]).to.have.property('description');
      expect(res.body[0]).to.have.property('tasks');
      expect(res.body[0].tasks[0]).to.have.property('id');
      expect(res.body[0].tasks[0]).to.have.property('name');
      expect(res.body[0].tasks[0]).to.have.property('description');
      expect(res.body[0].tasks[0]).to.have.property('completed');
      expect(res.body[0].tasks[0]).to.have.property('createdAt');
      expect(res.body[0].tasks[0]).to.have.property('roadmapId');
      expect(res.body[0].tasks[0]).to.have.property('createdByUser');
      expect(res.body[0].tasks[0]).to.have.property('ratings');
    });
  });

  describe('POST /roadmaps/', function () {
    it('Should add new roadmap', async function () {
      const before = await loggedInAgent.get('/roadmaps/');
      const res = await loggedInAgent
        .post('/roadmaps/')
        .type('json')
        .send({ name: 'TestRoadmap', description: 'TestDescription' });
      const after = await loggedInAgent.get('/roadmaps/');
      expect(res.status).to.equal(200);
      expect(before.body.length + 1).to.equal(after.body.length);
      const addedRoadmap = after.body.find(
        (rm: any) => rm.name == 'TestRoadmap',
      );
      expect(addedRoadmap).to.exist;
    });
  });

  describe('PATCH /roadmaps/:roadmapId', function () {
    it('Should patch roadmap', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent
        .patch('/roadmaps/' + firstRoadmapId)
        .type('json')
        .send({ name: 'patchedname', description: 'patcheddesc' });
      const after = await loggedInAgent.get('/roadmaps/');
      expect(res.status).to.equal(200);
      const patchedRoadmap = after.body.find(
        (rm: any) => rm.name == 'patchedname',
      );
      expect(patchedRoadmap).to.exist;
      expect(patchedRoadmap.description).to.equal('patcheddesc');
    });
  });

  describe('DELETE /roadmaps/:roadmapId', function () {
    it('Should delete roadmap', async function () {
      const before = await loggedInAgent.get('/roadmaps/');
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent.delete('/roadmaps/' + firstRoadmapId);
      const after = await loggedInAgent.get('/roadmaps/');
      expect(res.status).to.equal(200);
      expect(before.body.length - 1).to.equal(after.body.length);
    });
  });

  describe('GET /roadmaps/:roadmapId/users/', function () {
    it("Should return roadmaps's users names, types", async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent.get(`/roadmaps/${firstRoadmapId}/users/`);
      expect(res.status).to.equal(200);
      assert(res.body.length > 1);
      assert.property(res.body[0], 'username');
      assert.property(res.body[0], 'type');
      assert(res.body[0].username.length > 0);
    });
  });

  describe('GET /roadmaps/:roadmapId/users/whoami', function () {
    it('Should respond with user info', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res2 = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/whoami`,
      );
      expect(res2.status).to.equal(200);
      expect(res2.body).to.have.property('id');
      expect(res2.body).to.have.property('username');
      expect(res2.body).to.have.property('type');
    });
  });

  describe('GET /roadmaps/:id/tasks', function () {
    it('Should get roadmaps tasks', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent.get(
        '/roadmaps/' + firstRoadmapId + '/tasks?eager=1',
      );

      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('id');
      expect(res.body[0]).to.have.property('name');
      expect(res.body[0]).to.have.property('description');
      expect(res.body[0]).to.have.property('completed');
      expect(res.body[0]).to.have.property('createdAt');
      expect(res.body[0]).to.have.property('roadmapId');
      expect(res.body[0]).to.have.property('createdByUser');
      expect(res.body[0]).to.have.property('ratings');
    });
  });
  describe('POST /roadmaps/:id/tasks', function () {
    it('Should add new task to roadmap', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstUserId = (await User.query().first()).id;
      const before = await loggedInAgent.get(
        '/roadmaps/' + firstRoadmapId + '/tasks?eager=1',
      );
      const res = await loggedInAgent
        .post('/roadmaps/' + firstRoadmapId + '/tasks')
        .type('json')
        .send({
          name: 'testtask',
          description: 'testdesc',
          createdByUser: firstUserId,
        });
      const after = await loggedInAgent.get(
        '/roadmaps/' + firstRoadmapId + '/tasks?eager=1',
      );

      expect(res.status).to.equal(200);
      expect(before.body.length + 1).to.equal(after.body.length);
    });
  });
});
