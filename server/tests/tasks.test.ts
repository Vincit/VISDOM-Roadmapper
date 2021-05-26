import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import Task from '../src/api/tasks/tasks.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission, RoleType } from '../src/types/customTypes';

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
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type:
          RoleType.Admin & ~Permission.RoadmapReadUsers & ~Permission.TaskRead,
      });
      const res = await loggedInAgent.get(`/roadmaps/${firstRoadmapId}/tasks/`);
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
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      expect(added.createdByUser).to.equal(userId);
    });
    it('Should not add new task with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type:
          RoleType.Admin &
          ~Permission.RoadmapReadUsers &
          ~Permission.TaskCreate,
      });
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/tasks/`)
        .type('json')
        .send({
          name: 'testtask',
          description: 'testdesc',
        });
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin,
      });
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
    it('Should not delete task with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.TaskEdit,
      });
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}`,
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
    it('Should not patch task with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.TaskEdit,
      });
      const res = await loggedInAgent
        .patch(`/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}`)
        .type('json')
        .send({
          name: 'patched',
          description: 'patched',
        });
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/`,
      );
      const patched = after.body.find((task: any) => task.name == 'patched');
      expect(patched).not.to.exist;
    });
  });
});
