import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { app } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import Task from '../src/api/tasks/tasks.model';
describe('Test /tasks/ api', function () {
  describe('GET /tasks/', function () {
    it('Should get all tasks', async function () {
      const res = await chai.request(app).get('/tasks/');
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

  describe('POST /tasks/', function () {
    it('Should add new task', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const firstUserId = (await User.query().first()).id;
      const before = await chai.request(app).get('/tasks/');
      const res = await chai.request(app).post('/tasks/').type('json').send({
        name: 'testtask',
        description: 'testdesc',
        createdByUser: firstUserId,
        roadmapId: firstRoadmapId,
      });
      const after = await chai.request(app).get('/tasks/');
      expect(res.status).to.equal(200);
      expect(before.body.length + 1).to.equal(after.body.length);
      const added = after.body.find((task: any) => task.name == 'testtask');
      expect(added).to.exist;
      expect(added.description).to.equal('testdesc');
      expect(added.createdByUser).to.equal(firstUserId);
      expect(added.roadmapId).to.equal(firstRoadmapId);
    });
  });

  describe('DELETE /tasks/', function () {
    it('Should delete task', async function () {
      const firstTaskId = (await Task.query().first()).id;
      const before = await chai.request(app).get('/tasks/');
      const res = await chai.request(app).delete('/tasks/' + firstTaskId);
      const after = await chai.request(app).get('/tasks/');
      expect(res.status).to.equal(200);
      expect(before.body.length - 1).to.equal(after.body.length);
    });
  });

  describe('PATCH /tasks/', function () {
    it('Should patch task', async function () {
      const firstTaskId = (await Task.query().first()).id;
      const res = await chai
        .request(app)
        .patch('/tasks/' + firstTaskId)
        .type('json')
        .send({
          name: 'patched',
          description: 'patched',
        });
      expect(res.status).to.equal(200);
      const after = await chai.request(app).get('/tasks/');
      const patched = after.body.find((task: any) => task.name == 'patched');
      expect(patched).to.exist;
      expect(patched.description).to.equal('patched');
    });
  });

  describe('POST /tasks/:id/ratings', function () {
    it('Should add rating to task', async function () {
      const firstTaskId = (await Task.query().first()).id;
      const secondUserId = (await User.query())[1].id;
      const res = await chai
        .request(app)
        .post('/tasks/' + firstTaskId + '/ratings')
        .type('json')
        .send({
          dimension: 0,
          value: 5,
          createdByUser: secondUserId,
        });
      expect(res.status).to.equal(200);
      const after = await chai.request(app).get('/taskratings/');
      const added = after.body.find(
        (rating: any) =>
          rating.parentTask === firstTaskId &&
          rating.createdByUser === secondUserId,
      );
      expect(added).to.exist;
      expect(added.dimension).to.equal(0);
      expect(added.value).to.equal(5);
    });
  });

  describe('POST & GET /tasks/:id/relatedTasks', function () {
    it('Should add related task', async function () {
      const firstTaskId = (await Task.query().first()).id;
      const secondTaskId = (await Task.query())[1].id;
      const before = await chai
        .request(app)
        .get('/tasks/' + firstTaskId + '/relatedTasks');
      const res = await chai
        .request(app)
        .post('/tasks/' + firstTaskId + '/relatedTasks')
        .type('json')
        .send({
          id: secondTaskId,
        });
      expect(res.status).to.equal(200);
      const after = await chai
        .request(app)
        .get('/tasks/' + firstTaskId + '/relatedTasks');
      expect(after.body[0].id).to.equal(secondTaskId);
      expect(before.body.length + 1).to.equal(after.body.length);
    });
  });
});
