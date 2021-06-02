import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import Task from '../src/api/tasks/tasks.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission, RoleType } from '../../shared/types/customTypes';
import TaskRating from '../src/api/taskratings/taskratings.model';

describe('Test /roadmap/:roadmapId/tasks/:taskId/taskratings/ api', function () {
  describe('GET /roadmap/:roadmapId/tasks/:taskId/taskratings/', function () {
    it('Should get all taskratings', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const res = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('dimension');
      expect(res.body[0]).to.have.property('value');
      expect(res.body[0]).to.have.property('createdByUser');
      expect(res.body[0]).to.have.property('parentTask');
    });
    it('Should not get taskratings with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.TaskRatingRead,
      });
      const res = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      expect(res.status).to.equal(403);
    });
  });
  describe('POST /roadmap/:roadmapId/tasks/:taskId/taskratings/', function () {
    it('Should add new taskrating', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`)
        .type('json')
        .send({
          dimension: 1,
          value: 5,
        });
      expect(res.status).to.equal(200);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      expect(before.body.length + 1).to.equal(after.body.length);
    });
    it('Should not add new taskrating with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.TaskRate,
      });
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`)
        .type('json')
        .send({
          dimension: 1,
          value: 5,
        });
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      expect(before.body.length).to.equal(after.body.length);
    });
  });

  describe('DELETE /roadmap/:roadmapId/tasks/:taskId/taskratings/:ratingId', function () {
    it('Should delete taskrating', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const firstRatingId = (await TaskRating.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings/${firstRatingId}`,
      );
      expect(res.status).to.equal(200);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      expect(before.body.length - 1).to.equal(after.body.length);
    });
    it('Should not delete taskrating with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const firstRatingId = (await TaskRating.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.TaskRatingEdit,
      });
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings/${firstRatingId}`,
      );
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings`,
      );
      expect(before.body.length).to.equal(after.body.length);
    });
  });

  describe('PATCH /roadmap/:roadmapId/tasks/:taskId/taskratings/:ratingId', function () {
    it('Should patch taskrating', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const firstRatingId = (await TaskRating.query().first()).id;
      const res = await loggedInAgent
        .patch(
          `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings/${firstRatingId}`,
        )
        .type('json')
        .send({
          value: 9,
        });
      expect(res.status).to.equal(200);
      expect(res.body.dimension).to.equal(0);
      expect(res.body.value).to.equal(9);
    });
    it('Should not patch taskrating with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstTaskId = (await Task.query().first()).id;
      const firstRatingId = (await TaskRating.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.TaskRatingEdit,
      });
      const res = await loggedInAgent
        .patch(
          `/roadmaps/${firstRoadmapId}/tasks/${firstTaskId}/taskratings/${firstRatingId}`,
        )
        .type('json')
        .send({
          value: 9,
        });
      expect(res.status).to.equal(403);
      expect(res.body.dimension).not.to.equal(0);
      expect(res.body.value).not.to.equal(9);
    });
  });
});
