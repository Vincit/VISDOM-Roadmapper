import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import { Permission, RoleType } from '../../shared/types/customTypes';

describe('Test /roadmaps/:roadmapId/jiraconfigurations/ api', function () {
  describe('POST /roadmaps/:roadmapId/jiraconfigurations/', function () {
    it('Should not add jiraconfiguration with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.JiraConfigurationEdit,
      });
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/jiraconfigurations`)
        .type('json')
        .send({});
      expect(res.status).to.equal(403);
    });
    it('Should not receive 403 error with correct permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const res = await loggedInAgent
        .post(`/roadmaps/${firstRoadmapId}/jiraconfigurations`)
        .type('json')
        .send({});
      expect(res.status).not.to.equal(403);
    });
  });
  describe('PATCH /roadmaps/:roadmapId/jiraconfigurations/:jiraId', function () {
    it('Should not patch jiraconfiguration with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.JiraConfigurationEdit,
      });
      const res = await loggedInAgent
        .patch(`/roadmaps/${firstRoadmapId}/jiraconfigurations/1`)
        .type('json')
        .send({});
      expect(res.status).to.equal(403);
    });
  });
  describe('DELETE /roadmaps/:roadmapId/jiraconfigurations/:jiraId', function () {
    it('Should not delete jiraconfiguration with incorrect permissions', async function () {
      const firstRoadmapId = (await Roadmap.query().first()).id;
      const userId = (
        await User.query().where({ username: 'AdminPerson1' }).first()
      ).id;
      await Role.query().patchAndFetchById([userId, firstRoadmapId], {
        type: RoleType.Admin & ~Permission.JiraConfigurationEdit,
      });
      const res = await loggedInAgent
        .delete(`/roadmaps/${firstRoadmapId}/jiraconfigurations/1`)
        .type('json')
        .send({});
      expect(res.status).to.equal(403);
    });
  });
});
