import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { app, loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import Task from '../src/api/tasks/tasks.model';
describe('Test /roadmaps/:roadmapId/tasks/ api', function () {
  describe('GET /roadmaps/:roadmapId/tasks/', function () {
    it('Should get all tasks', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent.get(`/roadmaps/${firstRoadmapId}/tasks/`);
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('id');
      expect(res.body[0]).to.have.property('name');
      expect(res.body[0]).to.have.property('description');
      expect(res.body[0]).to.have.property('completed');
      expect(res.body[0]).to.have.property('createdAt');
      expect(res.body[0]).to.have.property('roadmapId');
      expect(res.body[0]).to.have.property('createdByUser');
    });
  });

  describe('POST /roadmaps/:roadmapId/tasks/', function () {
    it('Should add new task', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstUserId = (await User.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/tasks/`)
        .type('json')
        .send({
          name: 'testtask',
          description: 'testdesc',
          createdByUser: firstUserId,
        });
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      expect(res.status).to.equal(200);
      expect(before.body.length + 1).to.equal(after.body.length);
      const added = after.body.find((task: any) => task.name == 'testtask');
      expect(added).to.exist;
      expect(added.description).to.equal('testdesc');
      expect(added.createdByUser).to.equal(firstUserId);
      expect(added.roadmapId).to.equal(firstRoadmapId);
    });
  });

  describe('DELETE /roadmaps/:roadmapId/tasks/:taskId', function () {
    it('Should delete task', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}`,
      );
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      expect(res.status).to.equal(200);
      expect(before.body.length - 1).to.equal(after.body.length);
    });
  });

  describe('PATCH /roadmaps/:roadmapId/tasks/:taskId', function () {
    it('Should patch task', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const res = await loggedInAgent
        .patch(`/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}`)
        .type('json')
        .send({
          name: 'patched',
          description: 'patched',
        });
      expect(res.status).to.equal(200);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const patched = after.body.find((task: any) => task.name == 'patched');
      expect(patched).to.exist;
      expect(patched.description).to.equal('patched');
    });
  });
});
