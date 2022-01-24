import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import Task from '../src/api/tasks/tasks.model';
import { Permission } from '../../shared/types/customTypes';
import { withoutPermission } from './testUtils';
import { getUser } from '../src/utils/testdataUtils';

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
    it('Should not get tasks with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.RoadmapReadUsers | Permission.TaskRead,
        () => loggedInAgent.get(`/roadmaps/${firstRoadmapId}/tasks/`),
      );
      expect(res.status).to.equal(403);
    });
  });

  describe('POST /roadmaps/:roadmapId/tasks/', function () {
    it('Should add new task', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/tasks/`)
        .type('json')
        .send({
          name: 'testtask',
          description: 'testdesc',
        });
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      expect(res.status).to.equal(200);
      expect(before.body.length + 1).to.equal(after.body.length);
      const added = after.body.find((task: any) => task.name == 'testtask');
      expect(added).to.exist;
      expect(added.description).to.equal('testdesc');
      expect(added.roadmapId).to.equal(firstRoadmapId);
      const userId = (await getUser('AdminPerson1')).id;
      expect(added.createdByUser).to.equal(userId);
    });
    it('Should not add new task with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.RoadmapReadUsers | Permission.TaskCreate,
        () =>
          loggedInAgent
            .post(`/roadmaps/${firstRoadmapId}/tasks/`)
            .type('json')
            .send({
              name: 'testtask',
              description: 'testdesc',
            }),
      );
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      expect(res.status).to.equal(403);
      expect(before.body.length).to.equal(after.body.length);
      const added = after.body.find((task: any) => task.name == 'testtask');
      expect(added).not.to.exist;
    });
  });

  describe('DELETE /roadmaps/:roadmapId/tasks/:taskId', function () {
    it('Should delete task', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const taskId = (
        await Task.query().where('roadmapId', firstRoadmapId).first()
      ).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/tasks/${taskId}`,
      );
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      expect(res.status).to.equal(200);
      expect(before.body.length - 1).to.equal(after.body.length);
    });
    it('Should not delete task with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const taskId = (
        await Task.query().where('roadmapId', firstRoadmapId).first()
      ).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.TaskEdit,
        () =>
          loggedInAgent.delete(`/roadmaps/${firstRoadmapId}/tasks/${taskId}`),
      );
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      expect(res.status).to.equal(403);
      expect(before.body.length).to.equal(after.body.length);
    });
  });

  describe('PATCH /roadmaps/:roadmapId/tasks/:taskId', function () {
    it('Should patch task', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const taskId = (
        await Task.query().where('roadmapId', firstRoadmapId).first()
      ).id;
      const res = await loggedInAgent
        .patch(`/roadmaps/${firstRoadmapId}/tasks/${taskId}`)
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
    it('Should not patch task with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const taskId = (
        await Task.query().where('roadmapId', firstRoadmapId).first()
      ).id;
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.TaskEdit,
        () =>
          loggedInAgent
            .patch(`/roadmaps/${firstRoadmapId}/tasks/${taskId}`)
            .type('json')
            .send({
              name: 'patched',
              description: 'patched',
            }),
      );
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const patched = after.body.find((task: any) => task.name == 'patched');
      expect(patched).not.to.exist;
    });
  });
});
