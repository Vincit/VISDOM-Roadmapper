import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { app, loggedInAgent, agentData } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission, RoleType } from '../../shared/types/customTypes';
import { withoutPermission } from './testUtils';

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
      const before = await loggedInAgent.get(
        `/roadmaps/${firstRoadmapId}/users/`,
      );
      const newUser = await registerNewUser({
        email: 'test@email.com',
        password: 'test',
      });
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.RoadmapEditRoles,
        () =>
          loggedInAgent
            .post(`/roadmaps/${firstRoadmapId}/inviteUser`)
            .type('json')
            .send({ userId: newUser.id, type: newUser.type }),
      );
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
        await User.query().where({ email: agentData.email }).first()
      ).id;
      const res = await loggedInAgent
        .patch(`/roadmaps/${firstRoadmapId}/users/${userId}/roles`)
        .type('json')
        .send({ type: RoleType.Developer });
      expect(res.status).to.equal(200);
      const res2 = await loggedInAgent.get('/users/roles');
      expect(res2.status).to.equal(200);
      const role = res2.body.find(
        (role: Role) => role.roadmapId === firstRoadmapId,
      );
      expect(role.type).to.equal(RoleType.Developer);
    });
    it('Should not patch user roles with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ email: agentData.email }).first()
      ).id;
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.RoadmapEditRoles,
        () =>
          loggedInAgent.patch(
            `/roadmaps/${firstRoadmapId}/users/${userId}/roles`,
          ),
      );
      expect(res.status).to.equal(403);
      const after = await loggedInAgent.get('/users/roles');
      expect(after.status).to.equal(200);
      const role = after.body.find(
        (role: Role) => role.roadmapId === firstRoadmapId,
      );
      expect(role.type).not.to.equal(RoleType.Developer);
    });
  });
  describe('DELETE /roadmaps/:roadmapId/users/:userId/roles', function () {
    it('Should delete user roles', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ email: agentData.email }).first()
      ).id;
      const res = await loggedInAgent.delete(
        `/roadmaps/${firstRoadmapId}/users/${userId}/roles`,
      );
      expect(res.status).to.equal(200);
      const res2 = await loggedInAgent.get('/users/roles');
      expect(res2.status).to.equal(200);
      const role = res2.body.find(
        (role: Role) => role.roadmapId === firstRoadmapId,
      );
      expect(role).not.to.exist;
    });
    it('Should not delete user roles with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ email: agentData.email }).first()
      ).id;
      const res = await withoutPermission(
        firstRoadmapId,
        Permission.RoadmapEditRoles,
        () =>
          loggedInAgent.delete(
            `/roadmaps/${firstRoadmapId}/users/${userId}/roles`,
          ),
      );
      expect(res.status).to.equal(403);
      const res2 = await loggedInAgent.get('/users/roles');
      expect(res2.status).to.equal(200);
      expect(res2.body[0].type).to.exist;
    });
  });
});
