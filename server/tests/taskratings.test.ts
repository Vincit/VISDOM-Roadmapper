import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import Task from '../src/api/tasks/tasks.model';
import {
  Permission,
  TaskRatingDimension,
} from '../../shared/types/customTypes';
import { withoutPermission, getTestRatingData } from './testUtils';

describe('Test /roadmap/:roadmapId/tasks/:taskId/taskratings/ api', function () {
  describe('GET /roadmap/:roadmapId/tasks/:taskId/taskratings/', function () {
    it('Should get all taskratings', async function () {
      const { taskId, roadmapId } = await getTestRatingData();
      const res = await loggedInAgent.get(
        `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
      );
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('dimension');
      expect(res.body[0]).to.have.property('value');
      expect(res.body[0]).to.have.property('createdByUser');
      expect(res.body[0]).to.have.property('parentTask');
      res.body.forEach((rating: any) => {
        expect(rating.parentTask, 'incorrect parent task').to.equal(taskId);
      });
    });
    it('Should not get taskratings with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const taskId = (
        await Task.query().where('roadmapId', firstRoadmapId).first()
      ).id;
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.TaskRatingRead,
        () =>
          loggedInAgent.get(
            `/roadmaps/${firstRoadmapId}/tasks/${taskId}/taskratings`,
          ),
      );
      expect(res.status).to.equal(403);
    });
  });
  describe('POST /roadmap/:roadmapId/tasks/:taskId/taskratings/', function () {
    it('Should add new taskrating', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const taskId = (
        await Task.query().where('roadmapId', firstRoadmapId).first()
      ).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${taskId}/taskratings`,
      );
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/tasks/${taskId}/taskratings`)
        .type('json')
        .send({
          dimension: TaskRatingDimension.RequiredWork,
          value: 5,
        });
      expect(res.status).to.equal(200);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${taskId}/taskratings`,
      );
      expect(before.body.length + 1).to.equal(after.body.length);
    });
    it('Should not add new taskrating with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const taskId = (
        await Task.query().where('roadmapId', firstRoadmapId).first()
      ).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${taskId}/taskratings`,
      );
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.TaskRate,
        () =>
          loggedInAgent
            .post(`/roadmaps/${firstRoadmapId}/tasks/${taskId}/taskratings`)
            .type('json')
            .send({
              dimension: TaskRatingDimension.RequiredWork,
              value: 5,
            }),
      );
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/tasks/${taskId}/taskratings`,
      );
      expect(before.body.length).to.equal(after.body.length);
    });
  });

  describe('DELETE /roadmap/:roadmapId/tasks/:taskId/taskratings/:ratingId', function () {
    it('Should delete taskrating', async function () {
      const { ratingId, taskId, roadmapId } = await getTestRatingData();
      const before = await loggedInAgent.get(
        `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
      );
      const res = await loggedInAgent.delete(
        `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings/${ratingId}`,
      );
      expect(res.status).to.equal(200);
      const after = await loggedInAgent.get(
        `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
      );
      expect(before.body.length - 1).to.equal(after.body.length);
    });
    it('Should not delete taskrating with incorrect permissions', async function () {
      const { ratingId, taskId, roadmapId } = await getTestRatingData();
      if (!roadmapId) assert.fail('Roadmap should exist');
      const before = await loggedInAgent.get(
        `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
      );
      const res = await withoutPermission(
        roadmapId,
        Permission.TaskRatingEdit,
        () =>
          loggedInAgent.delete(
            `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings/${ratingId}`,
          ),
      );
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get(
        `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
      );
      expect(before.body.length).to.equal(after.body.length);
    });
  });

  describe('PATCH /roadmap/:roadmapId/tasks/:taskId/taskratings/:ratingId', function () {
    it('Should patch taskrating', async function () {
      const { ratingId, taskId, roadmapId } = await getTestRatingData();
      const res = await loggedInAgent
        .patch(`/roadmaps/${roadmapId}/tasks/${taskId}/taskratings/${ratingId}`)
        .type('json')
        .send({
          value: 9,
        });
      expect(res.status).to.equal(200);
      expect(res.body.dimension).to.equal(TaskRatingDimension.RequiredWork);
      expect(res.body.value).to.equal(9);
    });
    it('Should not patch taskrating with incorrect permissions', async function () {
      const { ratingId, taskId, roadmapId } = await getTestRatingData();
      if (!roadmapId) assert.fail('Roadmap should exist');
      const res = await withoutPermission(
        roadmapId,
        Permission.TaskRatingEdit,
        () =>
          loggedInAgent
            .patch(
              `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings/${ratingId}`,
            )
            .type('json')
            .send({
              value: 9,
            }),
      );
      expect(res.status).to.equal(403);
      expect(res.body.dimension).not.to.equal(TaskRatingDimension.RequiredWork);
      expect(res.body.value).not.to.equal(9);
    });
  });
});
