import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { app, loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import Task from '../src/api/tasks/tasks.model';
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
  });
});
