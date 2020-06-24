import chai, { assert, expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { app } from './setuptests';
import User from '../src/api/users/users.model';
import Task from '../src/api/tasks/tasks.model';
import TaskRating from '../src/api/taskratings/taskratings.model';

describe('Test /taskratings/ api', function () {
  describe('GET /taskratings/', function () {
    it('Should get all taskratings', async function () {
      const res = await chai.request(app).get('/taskratings/');
      expect(res.status).to.equal(200);
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property('dimension');
      expect(res.body[0]).to.have.property('value');
      expect(res.body[0]).to.have.property('createdByUser');
      expect(res.body[0]).to.have.property('parentTask');
    });
  });
  describe('POST /taskratings/', function () {
    it('Should add new taskrating', async function () {
      const firstTaskId = (await Task.query().first()).id;
      const firstUserId = (await User.query().first()).id;
      const before = await chai.request(app).get('/taskratings/');
      const res = await chai
        .request(app)
        .post('/taskratings/')
        .type('json')
        .send({
          dimension: 1,
          value: 5,
          parentTask: firstTaskId,
          createdByUser: firstUserId,
        });
      expect(res.status).to.equal(200);
      const after = await chai.request(app).get('/taskratings/');
      expect(before.body.length + 1).to.equal(after.body.length);
    });
  });

  describe('DELETE /taskratings/', function () {
    it('Should delete taskrating', async function () {
      const firstRatingId = (await TaskRating.query().first()).id;
      const before = await chai.request(app).get('/taskratings/');
      const res = await chai
        .request(app)
        .delete('/taskratings/' + firstRatingId);
      expect(res.status).to.equal(200);
      const after = await chai.request(app).get('/taskratings/');
      expect(before.body.length - 1).to.equal(after.body.length);
    });
  });

  describe('PATCH /taskratings/', function () {
    it('Should patch taskrating', async function () {
      const firstRatingId = (await TaskRating.query().first()).id;
      const res = await chai
        .request(app)
        .patch('/taskratings/' + firstRatingId)
        .type('json')
        .send({
          dimension: 1,
          value: 9,
        });
      expect(res.status).to.equal(200);
      expect(res.body.dimension).to.equal(1);
      expect(res.body.value).to.equal(9);
    });
  });
});
