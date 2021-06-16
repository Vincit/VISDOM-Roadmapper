import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { app, loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission, RoleType } from '../../shared/types/customTypes';

const registerNewUser = async (user: object) =>
  (
    await chai
      .request(app)
      .keepOpen()
      .post('/users/register')
      .type('json')
      .send(user)
  ).body;

describe('Test /roadmaps/:roadmapId/roles/ api', function () {
  describe('POST /roadmaps/:roadmapId/inviteUser/', function () {
    it('Should invite user to roadmap', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/users/`,
      );
      const newUser = await registerNewUser({
        username: 'test',
        email: 'test@email.com',
        password: 'test',
      });
      const res2 = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/inviteUser`)
        .type('json')
        .send({ userId: newUser.id, type: newUser.type });
      expect(res2.status).to.equal(200);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/users/`,
      );
      expect(before.body.length + 1).to.equal(after.body.length);
    });
    it('Should not invite user to roadmap with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.RoadmapEditRoles,
      });
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/users/`,
      );
      const newUser = await registerNewUser({
        username: 'test',
        email: 'test@email.com',
        password: 'test',
      });
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/inviteUser`)
        .type('json')
        .send({ userId: newUser.id, type: newUser.type });
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/users/`,
      );
      expect(before.body.length).to.equal(after.body.length);
    });
  });
  describe('PATCH /roadmaps/:roadmapId/users/:userId/roles', function () {
    it('Should patch user roles', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      const res = await loggedInAgent
        .patch(`/roadmaps/${firstRoadmapId}/users/${userId}/roles`)
        .type('json')
        .send({ type: RoleType.Developer });
      expect(res.status).to.equal(200);
      const res2 = await loggedInAgent.get('/users/roles');
      expect(res2.status).to.equal(200);
      expect(res2.body[0].type).to.equal(RoleType.Developer);
    });
    it('Should not patch user roles with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.RoadmapEditRoles,
      });
      const res = await loggedInAgent.patch(
        `/roadmaps/${firstRoadmapId}/users/${userId}/roles`,
      );
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get('/users/roles');
      expect(after.status).to.equal(200);
      expect(after.body[0].type).not.to.equal(RoleType.Developer);
    });
  });
  describe('DELETE /roadmaps/:roadmapId/users/:userId/roles', function () {
    it('Should delete user roles', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/users/${userId}/roles`,
      );
      expect(res.status).to.equal(200);
      const res2 = await loggedInAgent.get('/users/roles');
      expect(res2.status).to.equal(200);
      expect(res2.body[0]).not.to.exist;
    });
    it('Should not delete user roles with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.RoadmapEditRoles,
      });
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/users/${userId}/roles`,
      );
      expect(res.status).to.equal(403);
      const res2 = await loggedInAgent.get('/users/roles');
      expect(res2.status).to.equal(200);
      expect(res2.body[0].type).to.exist;
    });
  });
});
