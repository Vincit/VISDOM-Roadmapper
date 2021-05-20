import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission, RoleType } from '../src/types/customTypes';
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
    it('Should not patch roadmap with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.RoadmapEdit,
      });
      const res = await loggedInAgent
        .patch('/roadmaps/' + firstRoadmapId)
        .type('json')
        .send({ name: 'patchedname', description: 'patcheddesc' });
      const after = await loggedInAgent.get('/roadmaps/');
      expect(res.status).to.equal(403);
      const patchedRoadmap = after.body.find(
        (rm: any) => rm.name == 'patchedname',
      );
      expect(patchedRoadmap).not.to.exist;
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
    it('Should not delete roadmap with incorrect permissions', async function () {
      const before = await loggedInAgent.get('/roadmaps/');
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.RoadmapDelete,
      });
      const res = await loggedInAgent.delete('/roadmaps/' + firstRoadmapId);
      const after = await loggedInAgent.get('/roadmaps/');
      expect(res.status).to.equal(403);
      expect(before.body.length).to.equal(after.body.length);
    });
  });

  describe('GET /roadmaps/:roadmapId/users/', function () {
    it("Should return roadmaps's users id's, names", async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent.get(`/roadmaps/${firstRoadmapId}/users/`);
      expect(res.status).to.equal(200);
      assert(res.body.length > 1);
      expect(Object.keys(res.body[0]).length).to.equal(2);
      assert.property(res.body[0], 'username');
      assert.property(res.body[0], 'id');
      assert(res.body[0].username.length > 0);
    });
    it("Should not return roadmaps's users with incorrect permissions", async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.RoadmapReadUsers,
      });
      const res = await loggedInAgent.get(`/roadmaps/${firstRoadmapId}/users/`);
      expect(res.status).to.equal(403);
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
});
